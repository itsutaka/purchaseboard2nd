import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/order';

// 獲取所有訂單
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // 獲取查詢參數
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // 構建查詢條件
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // 執行查詢，並關聯使用者資料
    const orders = await Order.find(query)
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('獲取訂單錯誤:', error);
    return NextResponse.json(
      { error: '獲取訂單時發生錯誤' },
      { status: 500 }
    );
  }
}

// 創建新訂單
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // 在實際應用中，需要從身份驗證中獲取 userId
    const userId = '507f1f77bcf86cd799439011'; // 模擬用戶 ID
    
    // 創建新訂單
    const newOrder = new Order({
      ...body,
      requestedBy: userId,
    });
    
    await newOrder.save();
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('創建訂單錯誤:', error);
    return NextResponse.json(
      { error: '創建訂單時發生錯誤' },
      { status: 500 }
    );
  }
}
