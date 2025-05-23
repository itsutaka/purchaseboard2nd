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

// Define a more specific type for what's written to Firestore
interface UserDataForFirestore {
  name: string;
  email: string; // email from token
  role: 'user' | 'staff' | 'admin';
  department?: string; // Optional field
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
    console.log("Backend /api/users received ID Token:", idToken); 

    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("Backend /api/users decoded Token:", decodedToken); 
    const uid = decodedToken.uid; 
    const emailFromToken = decodedToken.email; 

    if (!emailFromToken) { // Robust check for email from token
        console.error('Backend /api/users - Email not found in decoded token');
        return NextResponse.json({ message: 'Email not found in token' }, { status: 400 });
    }

    // 2. 解析請求體
    const body = await req.json() as Partial<UserData>; // Use Partial if not all fields are guaranteed
    console.log("Backend /api/users received body:", body); 
    const { name, department, role } = body; 
    console.log(`Backend /api/users - Parsed from body: name='${name}', role='${role}', department='${department}'`);

    if (!name || !role) { // email is from token, so only check name and role from body
      console.error(`Backend /api/users - Missing fields from body: name=${name}, role=${role}`);
      return NextResponse.json(
        { message: `Missing required fields from body. Received: name=${name}, role=${role}` },
        { status: 400 }
      );
    }

    if (!['user', 'staff', 'admin'].includes(role)) {
      console.error(`Backend /api/users - Invalid role: ${role}`);
      return NextResponse.json(
        { message: `Invalid role value. Must be one of: user, staff, admin. Received: ${role}` },
        { status: 400 }
      );
    }

    const userDocRef = firestore.collection('users').doc(uid);
    const userDocSnapshot = await userDocRef.get();

    if (userDocSnapshot.exists) {
        console.warn(`Backend /api/users - User document already exists for UID: ${uid}`);
        return NextResponse.json({ message: 'User document already exists' }, { status: 409 });
    }

    const now = Timestamp.now(); 

    const userDataToSet: UserDataForFirestore = {
      name,
      email: emailFromToken,
      role: role as 'user' | 'staff' | 'admin', 
      createdAt: now,
      updatedAt: now,
    };

    if (department !== undefined && department !== null && department.trim() !== '') { // Only add department if it's a meaningful string
      userDataToSet.department = department;
    }
    
    console.log(`Backend /api/users - Preparing to set user data for UID ${uid}:`, userDataToSet);
    await userDocRef.set(userDataToSet); 
    console.log(`Backend /api/users - User document created successfully for UID: ${uid}`);

    return NextResponse.json({ message: 'User document created successfully', userId: uid }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating user document:", error); // General error log
    if (error instanceof Error) {
        // Log more specific Firestore errors if possible
        console.error("Error details:", (error as any).details || error.message);
        const errorCode = (error as { code?: string }).code;
        if (errorCode === 'auth/argument-error' || errorCode === 'auth/id-token-expired') {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }
         // Check for Firestore specific error patterns if needed, though the generic one below might cover it
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error (Unknown Error Type)' }, { status: 500 });
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
