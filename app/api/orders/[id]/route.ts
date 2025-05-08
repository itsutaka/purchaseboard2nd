import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/order';

// 獲取單個訂單
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const order = await Order.findById(params.id)
      .populate('requestedBy', 'name email');
    
    if (!order) {
      return NextResponse.json(
        { error: '找不到訂單' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('獲取訂單錯誤:', error);
    return NextResponse.json(
      { error: '獲取訂單時發生錯誤' },
      { status: 500 }
    );
  }
}

// 更新訂單
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // 更新訂單
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).populate('requestedBy', 'name email');
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: '找不到訂單' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('更新訂單錯誤:', error);
    return NextResponse.json(
      { error: '更新訂單時發生錯誤' },
      { status: 500 }
    );
  }
}

// 刪除訂單
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const deletedOrder = await Order.findByIdAndDelete(params.id);
    
    if (!deletedOrder) {
      return NextResponse.json(
        { error: '找不到訂單' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('刪除訂單錯誤:', error);
    return NextResponse.json(
      { error: '刪除訂單時發生錯誤' },
      { status: 500 }
    );
  }
}
