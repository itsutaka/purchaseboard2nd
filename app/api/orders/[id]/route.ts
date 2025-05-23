import { NextRequest, NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// 假設你已經定義了 Order 的型別
interface Order {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'PURCHASED' | 'DELIVERED' | 'REJECTED' | 'CANCELLED'; // 根據你的實際狀態
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requestedBy: {
    userId: string;
    name: string;
    email: string;
  };
  quantity: number;
  price?: number;
  url?: string;
  comments?: Array<{
    text: string;
    authorId: string;
    authorName: string;
    createdAt: string | Timestamp; // Firestore 中可能是 Timestamp，轉換後是 string
  }>;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  // 其他可能的欄位
}

interface UserData {
    name?: string;
    email?: string;
    role?: 'user' | 'staff' | 'admin';
    department?: string;
    // 其他可能的欄位
}

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

    const orderData = orderDoc.data() as Order | undefined;

    if (!orderData) {
         return NextResponse.json({ message: 'Order data is empty' }, { status: 404 });
    }

    // 從 orderData 中移除 id 屬性 (如果存在)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...restOfOrderData } = orderData; // 使用解構賦值排除 id

    const convertTimestamp = (timestamp: string | Timestamp | undefined): string | null => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toISOString();
        }
        if (typeof timestamp === 'string') {
            return timestamp;
        }
        return null;
    };

    return NextResponse.json({
      id: orderDoc.id, // 這是主要的 ID
      ...restOfOrderData, // 展開不包含 id 的其餘數據
      createdAt: convertTimestamp(orderData.createdAt), // 這裡還是用 orderData，因為 restOfOrderData 的型別可能不直接包含 createdAt
      updatedAt: convertTimestamp(orderData.updatedAt), // 同上
    });
  } catch (error: unknown) {
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
    const userData = userDoc.data() as UserData | undefined;

    if (userData?.role !== 'staff' && userData?.role !== 'admin') {
         return NextResponse.json({ message: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const orderId = params.id;
    const body = await req.json();
    const { status, price, url } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: { [key: string]: any; updatedAt: Timestamp } = {
        updatedAt: Timestamp.now(),
    };

    if (status !== undefined) updateData.status = status;
    if (price !== undefined) updateData.price = price;
    if (url !== undefined) updateData.url = url;

    if (Object.keys(updateData).length <= 1 && !status && !price && !url) { // 確保至少有一個有效欄位被更新
        return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    const orderDocRef = firestore.collection('orders').doc(orderId);
    const currentOrderDoc = await orderDocRef.get();
    if (!currentOrderDoc.exists) {
        return NextResponse.json({ message: 'Order not found for update' }, { status: 404 });
    }
    
    await orderDocRef.update(updateData);

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating order:", error);
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
        const errorCodeString = (error as { code?: string | number }).code?.toString();

        if (errorCodeString === 'auth/argument-error' || errorCodeString === 'auth/id-token-expired') {
            errorMessage = 'Invalid or expired token';
            statusCode = 401;
        } else if (error.message.includes('NOT_FOUND') || error.message.includes('no entity to update') || errorCodeString === '5') {
            errorMessage = 'Order not found';
            statusCode = 404;
        } else {
             errorMessage = error.message || errorMessage;
        }
    }
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
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
    const userData = userDoc.data() as UserData | undefined;

    if (userData?.role !== 'admin') {
         return NextResponse.json({ message: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const orderId = params.id;
    const orderDocRef = firestore.collection('orders').doc(orderId);
    const currentOrderDoc = await orderDocRef.get();

    if (!currentOrderDoc.exists) {
        return NextResponse.json({ message: 'Order not found for deletion' }, { status: 404 });
    }

    await orderDocRef.delete();

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error: unknown) { // 確保這裡是 unknown
    console.error("Error deleting order:", error);
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
        const errorCodeString = (error as { code?: string | number }).code?.toString(); // 獲取 code 並轉為字串

        if (errorCodeString === 'auth/argument-error' || errorCodeString === 'auth/id-token-expired') {
            errorMessage = 'Invalid or expired token';
            statusCode = 401;
        // 主要依賴 message，如果 errorCode 是 '5' (字串)，也將其視為 NOT_FOUND 的一種情況
        } else if (error.message.includes('NOT_FOUND') || errorCodeString === '5') {
            errorMessage = 'Order not found';
            statusCode = 404;
        } else {
            errorMessage = error.message || errorMessage;
        }
    }
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
