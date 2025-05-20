import { NextRequest, NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// 獲取所有訂單
export async function GET(req: NextRequest) {
  try {
    const ordersSnapshot = await firestore.collection('orders')
                                          .orderBy('createdAt', 'desc')
                                          .get();

    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
      };
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
     if (error.code === 'auth/argument-error') {
         return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
     }
    return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
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

    console.log("Backend /api/orders: Received ID Token:", idToken);

    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("Backend /api/orders: Decoded Token:", decodedToken);

    const uid = decodedToken.uid;

    const userDoc = await firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
       return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    const body = await req.json();
    const { title, description, priority, quantity, url } = body;

    if (!title || !quantity) {
        return NextResponse.json({ message: 'Title and quantity are required' }, { status: 400 });
    }
     if (typeof quantity !== 'number' || quantity <= 0) {
        return NextResponse.json({ message: 'Quantity must be a positive number' }, { status: 400 });
     }

    const newOrderData = {
      title: title,
      description: description || null,
      priority: priority || 'MEDIUM',
      quantity: quantity,
      status: 'PENDING',
      url: url || null,
      requestedBy: {
        userId: uid,
        name: userData?.name || '未知用戶',
        email: userData?.email || decodedToken.email || '未知郵箱',
      },
      comments: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await firestore.collection('orders').add(newOrderData);

    return NextResponse.json({ id: docRef.id, ...newOrderData }, { status: 201 });

  } catch (error: any) {
    console.error("Backend /api/orders: Error:", error);
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired') {
      console.error("Backend /api/orders: Token verification failed:", error.message);
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
