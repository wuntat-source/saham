import { prisma } from '@/lib/prisma';
import { defaultMarketProvider } from '@/modules/market/providers';
import { BUY_BROKER_FEE_RATE, SELL_BROKER_FEE_RATE, SHARES_PER_LOT, STOCKS } from '@/lib/constants';
import { PlaceOrderRequest, TradeExecutionResult } from '@/types/trading';

export class TradingService {
  async executeOrder(userId: string, params: PlaceOrderRequest): Promise<TradeExecutionResult> {
    const { stock_code, order_type, order_mode = 'MARKET', lot_quantity, target_price } = params;

    // 1. Validations
    if (!lot_quantity || lot_quantity <= 0 || !Number.isInteger(lot_quantity)) {
      throw new Error('Jumlah lot harus berupa bilangan bulat positif lebih dari 0.');
    }

    const upperTicker = stock_code.toUpperCase().trim();
    const stockExists = STOCKS.find((s) => s.ticker === upperTicker);
    if (!stockExists) {
      throw new Error(`Saham dengan kode "${upperTicker}" tidak ditemukan.`);
    }

    const quote = await defaultMarketProvider.getQuote(upperTicker);
    const executionPrice = order_mode === 'LIMIT' && target_price && target_price > 0 ? target_price : quote.price;

    if (executionPrice <= 0) {
      throw new Error('Harga eksekusi tidak valid.');
    }

    const shares = lot_quantity * SHARES_PER_LOT;
    const grossAmount = shares * executionPrice;

    // 2. Atomic Database Transaction
    return await prisma.$transaction(async (tx) => {
      // Find or auto-initialize user wallet
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

      if (order_type === 'BUY') {
        const brokerFee = grossAmount * BUY_BROKER_FEE_RATE; // 0.15%
        const totalSettlement = grossAmount + brokerFee;

        if (wallet.cash_balance < totalSettlement) {
          throw new Error(
            `Saldo kas virtual tidak mencukupi. Diperlukan Rp ${totalSettlement.toLocaleString('id-ID')}, saldo kas Anda Rp ${wallet.cash_balance.toLocaleString('id-ID')}.`
          );
        }

        // Deduct wallet cash
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            cash_balance: wallet.cash_balance - totalSettlement,
          },
        });

        // Update or create portfolio
        const existingPortfolio = await tx.portfolio.findUnique({
          where: {
            user_id_stock_code: {
              user_id: userId,
              stock_code: upperTicker,
            },
          },
        });

        let newAvgBuyPrice = executionPrice;
        let newTotalShares = shares;

        if (existingPortfolio && existingPortfolio.total_shares > 0) {
          const existingShares = existingPortfolio.total_shares;
          const existingAvg = existingPortfolio.avg_buy_price;

          newTotalShares = existingShares + shares;
          newAvgBuyPrice = (existingShares * existingAvg + shares * executionPrice) / newTotalShares;

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
              stock_code: upperTicker,
              total_shares: shares,
              avg_buy_price: executionPrice,
            },
          });
        }

        // Create Order Audit
        const order = await tx.order.create({
          data: {
            user_id: userId,
            stock_code: upperTicker,
            order_type: 'BUY',
            order_mode: order_mode,
            target_price: executionPrice,
            lot_quantity,
            status: 'FILLED',
          },
        });

        // Create Transaction
        const transaction = await tx.transaction.create({
          data: {
            order_id: order.id,
            user_id: userId,
            stock_code: upperTicker,
            type: 'BUY',
            price: executionPrice,
            lot_quantity,
            total_amount: grossAmount,
            broker_fee: brokerFee,
            total_settlement: totalSettlement,
            realized_pnl: 0.0,
          },
        });

        return {
          success: true,
          order_id: order.id,
          transaction_id: transaction.id,
          stock_code: upperTicker,
          type: 'BUY',
          price: executionPrice,
          lot_quantity,
          shares,
          total_amount: grossAmount,
          broker_fee: brokerFee,
          total_settlement: totalSettlement,
          realized_pnl: 0.0,
          remaining_cash: updatedWallet.cash_balance,
        };
      } else {
        // SELL ORDER
        const existingPortfolio = await tx.portfolio.findUnique({
          where: {
            user_id_stock_code: {
              user_id: userId,
              stock_code: upperTicker,
            },
          },
        });

        if (!existingPortfolio || existingPortfolio.total_shares < shares) {
          const availableLots = existingPortfolio ? Math.floor(existingPortfolio.total_shares / SHARES_PER_LOT) : 0;
          throw new Error(
            `Jumlah lot saham tidak mencukupi. Anda memiliki ${availableLots} lot (${existingPortfolio?.total_shares || 0} lembar), diminta ${lot_quantity} lot.`
          );
        }

        const brokerFee = grossAmount * SELL_BROKER_FEE_RATE; // 0.25%
        const totalSettlement = grossAmount - brokerFee;
        const avgBuyPrice = existingPortfolio.avg_buy_price;

        // Realized P&L: (price - avg_buy_price) * shares - fee
        const realizedPnl = (executionPrice - avgBuyPrice) * shares - brokerFee;

        // Credit wallet cash
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            cash_balance: wallet.cash_balance + totalSettlement,
          },
        });

        // Deduct portfolio shares
        const remainingShares = existingPortfolio.total_shares - shares;
        await tx.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            total_shares: remainingShares,
            avg_buy_price: remainingShares === 0 ? 0 : existingPortfolio.avg_buy_price,
          },
        });

        // Create Order Audit
        const order = await tx.order.create({
          data: {
            user_id: userId,
            stock_code: upperTicker,
            order_type: 'SELL',
            order_mode: order_mode,
            target_price: executionPrice,
            lot_quantity,
            status: 'FILLED',
          },
        });

        // Create Transaction
        const transaction = await tx.transaction.create({
          data: {
            order_id: order.id,
            user_id: userId,
            stock_code: upperTicker,
            type: 'SELL',
            price: executionPrice,
            lot_quantity,
            total_amount: grossAmount,
            broker_fee: brokerFee,
            total_settlement: totalSettlement,
            realized_pnl: realizedPnl,
          },
        });

        return {
          success: true,
          order_id: order.id,
          transaction_id: transaction.id,
          stock_code: upperTicker,
          type: 'SELL',
          price: executionPrice,
          lot_quantity,
          shares,
          total_amount: grossAmount,
          broker_fee: brokerFee,
          total_settlement: totalSettlement,
          realized_pnl: realizedPnl,
          remaining_cash: updatedWallet.cash_balance,
        };
      }
    });
  }

  async getTransactionHistory(userId: string, options: { ticker?: string; type?: string; page?: number; limit?: number } = {}) {
    const { ticker, type, page = 1, limit = 20 } = options;
    const whereClause: any = { user_id: userId };

    if (ticker) whereClause.stock_code = ticker.toUpperCase();
    if (type) whereClause.type = type.toUpperCase();

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { executed_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      transactions,
    };
  }
}

export const tradingService = new TradingService();
