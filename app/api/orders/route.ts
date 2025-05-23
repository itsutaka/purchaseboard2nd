import { NextRequest, NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// 假設你已經定義了 Order 的型別 (可以與 [id]/route.ts 中的定義共用)
interface Order {
  id?: string; // id 在創建時可能不存在，由 Firestore 自動生成
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'PURCHASED' | 'DELIVERED' | 'REJECTED' | 'CANCELLED';
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
    createdAt: string | Timestamp;
  }>;
  createdAt?: string | Timestamp; // 創建時可能由後端設定
  updatedAt?: string | Timestamp; // 創建時可能由後端設定
}

// 獲取所有訂單 (可能需要分頁或過濾)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    // 只驗證 token，不存儲 decodedToken
    await auth.verifyIdToken(idToken);

    // 獲取所有訂單
    const ordersSnapshot = await firestore.collection('orders').get();

    const orders: Order[] = [];
    ordersSnapshot.forEach((doc) => {
      const data = doc.data() as Order;
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      });
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
      const errorCode = (error as { code?: string }).code;
      if (errorCode === 'auth/argument-error' || errorCode === 'auth/id-token-expired') {
        errorMessage = 'Invalid or expired token';
        statusCode = 401;
      } else {
        errorMessage = error.message || errorMessage;
      }
    }
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

// 創建新訂單
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 獲取用戶資料 (例如 name, email) 以填充 requestedBy
    const userDoc = await firestore.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
         return NextResponse.json({ message: 'User data not found' }, { status: 404 }); // 或者 403 Forbidden
    }

    const { name, email } = userData; // 假設 userData 中有 name 和 email

    const body = await req.json();
    const { title, description, priority, quantity, url } = body;

    // 基本驗證 (可以更嚴格)
    if (!title || !description || !priority || !quantity || quantity <= 0) {
        return NextResponse.json({ message: 'Missing or invalid required fields (title, description, priority, quantity)' }, { status: 400 });
    }

    const now = Timestamp.now();

    const newOrderData: Omit<Order, 'id'> = { // 使用 Omit 排除 id，因為它由 Firestore 生成
      title,
      description,
      status: 'PENDING', // 初始狀態
      priority,
      requestedBy: {
        userId: uid,
        name: name || 'Unknown User', // 提供預設值
        email: email || 'unknown@example.com',
      },
      quantity,
      url, // url 是可選的
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await firestore.collection('orders').add(newOrderData);

    return NextResponse.json({ message: 'Order created successfully', id: docRef.id }, { status: 201 });
  } catch (error: unknown) { // 使用 unknown
    console.error("Backend /api/orders: Error:", error);

    if (error instanceof Error) {
      console.error("Backend /api/orders: Token verification failed (or other Error):", error.message);
      const errorCode = (error as { code?: string }).code;
      if (errorCode === 'auth/argument-error' || errorCode === 'auth/id-token-expired') {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
      } else {
         // 其他 Error 物件，返回通用錯誤訊息 (或根據 error.message 進行更細緻的處理)
         return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
      }
    } else {
      // error 不是 Error 物件，無法存取 .message
      console.error("Backend /api/orders: Caught an error that is not an Error object:", error);
      return NextResponse.json({ message: 'Internal Server Error (Unknown Error Type)' }, { status: 500 });
    }
  }
}
