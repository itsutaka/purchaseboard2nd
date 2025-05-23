import { NextRequest, NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebaseAdmin'; // 從 Admin SDK 引入 auth 和 firestore
import { Timestamp } from 'firebase-admin/firestore'; // 只保留 Timestamp

// 定義 UserData 介面，使用 Firebase Timestamp
interface UserData {
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  department?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 創建新用戶文檔
export async function POST(req: NextRequest) {
  try {
    // 1. 驗證 Firebase ID Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    console.log("Backend received ID Token:", idToken); // <-- 後端 log 檢查接收到的 Token

    // 驗證 ID Token
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("Backend decoded Token:", decodedToken); // <-- 後端 log (如果成功)
    const uid = decodedToken.uid; // 獲取用戶 UID
    const email = decodedToken.email; // 從 Token 中獲取郵箱

    // 2. 解析請求體，獲取前端傳遞的額外用戶資訊
    const body = await req.json();
    const { name, department, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Missing required fields (name, email, role)' },
        { status: 400 }
      );
    }

    // 驗證 role 是否為有效值
    if (!['user', 'staff', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role value. Must be one of: user, staff, admin' },
        { status: 400 }
      );
    }

    // 3. 在 Firestore 的 'users' 集合中，以 UID 作為文件 ID 建立用戶文件
    const userDocRef = firestore.collection('users').doc(uid);
    const userDocSnapshot = await userDocRef.get();

    if (userDocSnapshot.exists) {
        // 如果用戶文件已經存在 (例如，用戶重複提交或某些情況)，可以選擇更新或返回錯誤
        // 這裡我們返回一個衝突錯誤
        return NextResponse.json({ message: 'User document already exists' }, { status: 409 });
    }

    const now = Timestamp.now(); // 使用 Firebase Timestamp

    // 明確指定 userData 的型別
    const userData: UserData = {
      name,
      email,
      role: role as 'user' | 'staff' | 'admin', // 型別斷言，因為我們已經驗證過 role 的值
      department: department || undefined, // 如果 department 不存在，設為 undefined
      createdAt: now,
      updatedAt: now,
    };

    await userDocRef.set(userData); // 建立文件

    return NextResponse.json({ message: 'User document created successfully', userId: uid }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating user document:", error);
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

// 獲取用戶資料
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await firestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data() as UserData;
    return NextResponse.json({
      id: userDoc.id,
      ...userData,
      // 將 Timestamp 轉換為 ISO 字串
      createdAt: userData.createdAt instanceof Timestamp 
        ? userData.createdAt.toDate().toISOString() 
        : userData.createdAt,
      updatedAt: userData.updatedAt instanceof Timestamp 
        ? userData.updatedAt.toDate().toISOString() 
        : userData.updatedAt,
    });
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
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
