import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/order';

// 添加評論
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { comment } = body;
    
    if (!comment || comment.trim() === '') {
      return NextResponse.json(
        { error: '評論不能為空' },
        { status: 400 }
      );
    }
    
    // 在實際應用中，可以在評論中添加用戶資訊
    // const userComment = `${userName}: ${comment}`;
    
    // 更新訂單，添加評論
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { $push: { comments: comment } },
      { new: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: '找不到訂單' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('添加評論錯誤:', error);
    return NextResponse.json(
      { error: '添加評論時發生錯誤' },
      { status: 500 }
    );
  }
}
