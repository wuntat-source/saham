import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { executeOrder } from '@/lib/order-engine';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await req.json();
    const { stock_code, type, mode = 'MARKET', lots, price } = body;

    if (!stock_code || !type || !lots) {
      return NextResponse.json(
        { error: 'Parameter stock_code, type (BUY/SELL), dan lots wajib diisi.' },
        { status: 400 }
      );
    }

    const upperType = type.toUpperCase();
    if (upperType !== 'BUY' && upperType !== 'SELL') {
      return NextResponse.json({ error: 'Tipe order harus BUY atau SELL.' }, { status: 400 });
    }

    const lotQuantity = parseInt(lots, 10);
    if (isNaN(lotQuantity) || lotQuantity <= 0) {
      return NextResponse.json({ error: 'Jumlah lot harus lebih besar dari 0.' }, { status: 400 });
    }

    const customPrice = price ? parseFloat(price) : undefined;

    const result = await executeOrder({
      userId: user.userId,
      stockCode: stock_code,
      orderType: upperType,
      orderMode: mode === 'LIMIT' ? 'LIMIT' : 'MARKET',
      lotQuantity,
      customPrice,
    });

    return NextResponse.json({
      success: true,
      transaction_id: result.transactionId,
      order_id: result.orderId,
      status: 'FILLED',
      type: result.type,
      stock_code: result.stockCode,
      price: result.price,
      lots: result.lotQuantity,
      total_amount: result.totalAmount,
      broker_fee: result.brokerFee,
      total_settlement: result.totalSettlement,
      realized_pnl: result.realizedPnl,
      remaining_balance: result.remainingCash,
    });
  } catch (error: any) {
    console.error('Order execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengeksekusi order.' },
      { status: 400 }
    );
  }
}
