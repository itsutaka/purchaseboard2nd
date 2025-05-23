import * as admin from 'firebase-admin';

// 使用一個變數來存儲 Firestore 實例，以避免重複創建
let firestore: admin.firestore.Firestore;
let auth: admin.auth.Auth;

console.log("Attempting to initialize Firebase Admin SDK...");
console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("FIREBASE_PROJECT_ID (admin):", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL (admin):", process.env.FIREBASE_CLIENT_EMAIL);
// 不要在日誌中輸出完整的 privateKey，但可以檢查它是否存在
console.log("FIREBASE_PRIVATE_KEY (admin) exists:", !!process.env.FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n'),
    };

    // 檢查憑證物件是否基本完整
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      console.error('Firebase Admin SDK Error: Missing required service account properties (projectId, clientEmail, or privateKey) in environment variables.');
      throw new Error('Missing required service account properties for Firebase Admin SDK.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // 您也可以在這裡明確指定 databaseURL 如果需要，但通常 credential 足夠
      // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    console.log("Firebase Admin SDK initialized successfully using service account.");

    firestore = admin.firestore();
    auth = admin.auth();

  } catch (error: unknown) {
    console.error('Firebase admin initialization error:', error);
    // 可以在這裡檢查 error 物件的詳細內容，例如 error.errorInfo
    if (error instanceof Error && (error as any).errorInfo) {
        console.error('Firebase Admin SDK Initialization Error Info:', (error as any).errorInfo);
    }
    throw new Error("Failed to initialize Firebase Admin SDK.");
  }
} else {
  // 如果 admin.apps.length > 0，表示已經初始化過了
  // 獲取已存在的實例
  const existingApp = admin.app();
  firestore = existingApp.firestore();
  auth = existingApp.auth();
  console.log("Firebase Admin SDK already initialized.");
}


// 導出常用的服務實例
export { firestore, auth };
export default admin; // 導出 admin 物件本身（如果需要其他服務）

// 獲取 Auth 服務的函數（提供一個訪問點，儘管直接導出也很常見）
export function getFirebaseAuth() {
  return auth; // 返回已初始化的 auth 實例
}

// 獲取 Firestore 服務的函數（提供一個訪問點，儘管直接導出也很常見）
export function getFirestoreDatabase() {
  return firestore; // 返回已初始化的 firestore 實例
}
