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
  console.log("POST /api/orders: Request received"); 
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("POST /api/orders: Auth header missing or malformed"); 
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log(`POST /api/orders: Token verified for UID: ${uid}`); 

    // 獲取用戶資料 (例如 name, email) 以填充 requestedBy
    console.log(`POST /api/orders: Fetching user data for UID: ${uid}`); 
    const userDoc = await firestore.collection('users').doc(uid).get();
    const userData = userDoc.data();

    console.log("POST /api/orders: User data from Firestore:", userData); 

    if (!userDoc.exists || !userData) { 
         console.log(`POST /api/orders: User data not found for UID: ${uid}`); 
         return NextResponse.json({ message: `User data not found for UID: ${uid}. Cannot create order.` }, { status: 404 });
    }

    const { name, email } = userData; // 確保 userData 存在

    const body = await req.json();
    console.log("POST /api/orders: Request body:", body); 
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
        name: name || decodedToken.name || 'Unknown User', // 從 decodedToken 中獲取 name 作為備用
        email: email || decodedToken.email || 'unknown@example.com', // 從 decodedToken 中獲取 email 作為備用
      },
      quantity,
      url, // url 是可選的
      createdAt: now,
      updatedAt: now,
    };

    console.log("POST /api/orders: Prepared new order data:", newOrderData); 
    const docRef = await firestore.collection('orders').add(newOrderData);
    console.log(`POST /api/orders: Order created with ID: ${docRef.id}`); 

    return NextResponse.json({ message: 'Order created successfully', id: docRef.id }, { status: 201 });
  } catch (error: unknown) { // 使用 unknown
    console.error("Backend /api/orders POST Error:", error); 

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
