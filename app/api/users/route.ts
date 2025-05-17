import { NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebaseAdmin'; // 從 Admin SDK 引入 auth 和 firestore
import { Timestamp } from 'firebase-admin/firestore'; // 引入 Timestamp

export async function POST(request: Request) {
  try {
    // 1. 驗證 Firebase ID Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing or malformed' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(idToken); // 驗證 Token 並獲取用戶資訊
    const uid = decodedToken.uid; // 獲取用戶 UID
    const email = decodedToken.email; // 從 Token 中獲取郵箱

    // 2. 解析請求體，獲取前端傳遞的額外用戶資訊
    const body = await request.json();
    const { name, department } = body;

    if (!name) {
       return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    // 3. 在 Firestore 的 'users' 集合中，以 UID 作為文件 ID 建立用戶文件
    const userDocRef = firestore.collection('users').doc(uid);
    const userDocSnapshot = await userDocRef.get();

    if (userDocSnapshot.exists) {
        // 如果用戶文件已經存在 (例如，用戶重複提交或某些情況)，可以選擇更新或返回錯誤
        // 這裡我們返回一個衝突錯誤
        return NextResponse.json({ message: 'User document already exists' }, { status: 409 });
    }

    const userData = {
      name: name,
      email: email, // 使用從驗證過的 Token 中獲取的郵箱
      role: 'user', // 設定預設角色
      department: department || null, // 可選字段
      createdAt: Timestamp.now(), // 使用 Firestore Timestamp
      updatedAt: Timestamp.now(),
    };

    await userDocRef.set(userData); // 建立文件

    return NextResponse.json({ message: 'User document created successfully', userId: uid }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating user document:", error);
     if (error.code === 'auth/argument-error') {
         return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
     }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
