import { prisma } from './prisma';
import { BUY_BROKER_FEE_RATE, SELL_BROKER_FEE_RATE, SHARES_PER_LOT } from './constants';
import { fetchStockQuote } from './market';

export interface ExecuteOrderParams {
  userId: string;
  stockCode: string;
  orderType: 'BUY' | 'SELL';
  orderMode: 'MARKET' | 'LIMIT';
  lotQuantity: number;
  customPrice?: number;
}

export interface ExecutionResult {
  success: boolean;
  orderId: string;
  transactionId: string;
  stockCode: string;
  type: 'BUY' | 'SELL';
  price: number;
  lotQuantity: number;
  sharesQuantity: number;
  totalAmount: number;
  brokerFee: number;
  totalSettlement: number;
  realizedPnl?: number;
  remainingCash: number;
  newAvgPrice?: number;
  newTotalShares?: number;
}

export async function executeOrder(params: ExecuteOrderParams): Promise<ExecutionResult> {
  const { userId, stockCode, orderType, orderMode, lotQuantity, customPrice } = params;

  if (lotQuantity <= 0 || !Number.isInteger(lotQuantity)) {
    throw new Error('Jumlah lot harus berupa bilangan bulat positif lebih dari 0.');
  }

  const upperStock = stockCode.toUpperCase();
  const quote = await fetchStockQuote(upperStock);
  const executionPrice = customPrice && customPrice > 0 ? customPrice : quote.price;
  const shares = lotQuantity * SHARES_PER_LOT;
  const totalAmount = shares * executionPrice;

  return await prisma.$transaction(async (tx) => {
    // 1. Get or initialize user wallet
    let wallet = await tx.wallet.findUnique({
      where: { user_id: userId },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          user_id: userId,
          cash_balance: 100_000_000.0,
        },
      });
    }

    if (orderType === 'BUY') {
      const brokerFee = totalAmount * BUY_BROKER_FEE_RATE;
      const requiredCash = totalAmount + brokerFee;

      if (wallet.cash_balance < requiredCash) {
        throw new Error(
          `Saldo kas tidak cukup. Dibutuhkan Rp ${requiredCash.toLocaleString('id-ID')}, saldo Anda Rp ${wallet.cash_balance.toLocaleString('id-ID')}.`
        );
      }

      // Deduct cash balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          cash_balance: wallet.cash_balance - requiredCash,
        },
      });

      // Update or create portfolio
      const existingPortfolio = await tx.portfolio.findUnique({
        where: {
          user_id_stock_code: {
            user_id: userId,
            stock_code: upperStock,
          },
        },
      });

      let newAvgBuyPrice = executionPrice;
      let newTotalShares = shares;

      if (existingPortfolio && existingPortfolio.total_shares > 0) {
        const currentTotalShares = existingPortfolio.total_shares;
        const currentAvgPrice = existingPortfolio.avg_buy_price;

        newTotalShares = currentTotalShares + shares;
        newAvgBuyPrice =
          (currentTotalShares * currentAvgPrice + shares * executionPrice) / newTotalShares;

        await tx.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            total_shares: newTotalShares,
            avg_buy_price: newAvgBuyPrice,
          },
        });
      } else if (existingPortfolio) {
        await tx.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            total_shares: shares,
            avg_buy_price: executionPrice,
          },
        });
      } else {
        await tx.portfolio.create({
          data: {
            user_id: userId,
            stock_code: upperStock,
            total_shares: shares,
            avg_buy_price: executionPrice,
          },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          user_id: userId,
          stock_code: upperStock,
          order_type: 'BUY',
          order_mode: orderMode,
          target_price: executionPrice,
          lot_quantity: lotQuantity,
          status: 'FILLED',
        },
      });

      // Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          order_id: order.id,
          user_id: userId,
          stock_code: upperStock,
          type: 'BUY',
          price: executionPrice,
          lot_quantity: lotQuantity,
          total_amount: totalAmount,
          broker_fee: brokerFee,
          total_settlement: requiredCash,
          realized_pnl: 0.0,
        },
      });

      return {
        success: true,
        orderId: order.id,
        transactionId: transaction.id,
        stockCode: upperStock,
        type: 'BUY',
        price: executionPrice,
        lotQuantity,
        sharesQuantity: shares,
        totalAmount,
        brokerFee,
        totalSettlement: requiredCash,
        remainingCash: updatedWallet.cash_balance,
        newAvgPrice: newAvgBuyPrice,
        newTotalShares,
      };
    } else {
      // SELL ORDER
      const existingPortfolio = await tx.portfolio.findUnique({
        where: {
          user_id_stock_code: {
            user_id: userId,
            stock_code: upperStock,
          },
        },
      });

      if (!existingPortfolio || existingPortfolio.total_shares < shares) {
        const availableLots = existingPortfolio ? Math.floor(existingPortfolio.total_shares / SHARES_PER_LOT) : 0;
        throw new Error(
          `Lot saham tidak cukup. Anda memiliki ${availableLots} lot (${existingPortfolio?.total_shares || 0} lembar), diminta ${lotQuantity} lot.`
        );
      }

      const brokerFee = totalAmount * SELL_BROKER_FEE_RATE;
      const grossProceed = totalAmount;
      const netSettlement = grossProceed - brokerFee;
      const avgBuyPrice = existingPortfolio.avg_buy_price;

      // Realized P&L: (Price - AvgBuyPrice) * Shares - Fee
      const realizedPnl = (executionPrice - avgBuyPrice) * shares - brokerFee;

      // Add cash to wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          cash_balance: wallet.cash_balance + netSettlement,
        },
      });

      // Deduct shares from portfolio
      const remainingShares = existingPortfolio.total_shares - shares;
      await tx.portfolio.update({
        where: { id: existingPortfolio.id },
        data: {
          total_shares: remainingShares,
          avg_buy_price: remainingShares === 0 ? 0 : existingPortfolio.avg_buy_price,
        },
      });

      // Create Order
      const order = await tx.order.create({
        data: {
          user_id: userId,
          stock_code: upperStock,
          order_type: 'SELL',
          order_mode: orderMode,
          target_price: executionPrice,
          lot_quantity: lotQuantity,
          status: 'FILLED',
        },
      });

      // Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          order_id: order.id,
          user_id: userId,
          stock_code: upperStock,
          type: 'SELL',
          price: executionPrice,
          lot_quantity: lotQuantity,
          total_amount: grossProceed,
          broker_fee: brokerFee,
          total_settlement: netSettlement,
          realized_pnl: realizedPnl,
        },
      });

      return {
        success: true,
        orderId: order.id,
        transactionId: transaction.id,
        stockCode: upperStock,
        type: 'SELL',
        price: executionPrice,
        lotQuantity,
        sharesQuantity: shares,
        totalAmount: grossProceed,
        brokerFee,
        totalSettlement: netSettlement,
        realizedPnl,
        remainingCash: updatedWallet.cash_balance,
        newTotalShares: remainingShares,
      };
    }
  });
}
