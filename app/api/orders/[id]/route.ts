import { NextRequest, NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebaseAdmin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// 獲取單個訂單
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.split(' ')[1];

    let uid = null;
    if (idToken) {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            uid = decodedToken.uid;
        } catch (error) {
            console.warn("Invalid token for GET request:", error);
        }
    }

    if (!uid) {
        // 如果要求所有用戶必須登入才能查看，這裡返回 401
        // return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        // 如果不要求，則繼續 (但安全性規則需要在 Firestore 層面處理未登入用戶的讀取權限)
    }

    const orderId = params.id;
    const orderDoc = await firestore.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
         return NextResponse.json({ message: 'Order data is empty' }, { status: 404 });
    }

    return NextResponse.json({
      id: orderDoc.id,
      ...orderData,
      createdAt: (orderData.createdAt as Timestamp)?.toDate().toISOString(),
      updatedAt: (orderData.updatedAt as Timestamp)?.toDate().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 更新訂單
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await firestore.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'staff' && userData?.role !== 'admin') {
         return NextResponse.json({ message: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const orderId = params.id;
    const body = await req.json();
    const { status, price, url } = body;

    const updateData: any = {
        updatedAt: Timestamp.now(),
    };

    if (status !== undefined) updateData.status = status;
    if (price !== undefined) updateData.price = price;
    if (url !== undefined) updateData.url = url;

    if (Object.keys(updateData).length <= 1) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const orderDocRef = firestore.collection('orders').doc(orderId);
    await orderDocRef.update(updateData);

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating order:", error);
     if (error.code === 'auth/argument-error') {
         return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
     }
     if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
     }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 刪除訂單
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await firestore.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') {
         return NextResponse.json({ message: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const orderId = params.id;
    await firestore.collection('orders').doc(orderId).delete();

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting order:", error);
     if (error.code === 'auth/argument-error') {
         return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
     }
     if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
     }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
