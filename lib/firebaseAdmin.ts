import * as admin from 'firebase-admin';

// 使用一個變數來存儲 Firestore 實例，以避免重複創建
let firestore: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    // 在非開發模式 (即生產模式或任何非 'development' 環境) 下，使用服務帳戶憑證初始化
    // 在開發模式下，Admin SDK 如果檢測到 FIREBASE_*_EMULATOR_HOST 環境變數會自動連接模擬器
    // 即使在開發模式，也需要 projectId
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID, // 使用後端專用的專案 ID 變數
      // 在生產環境下，會使用服務帳戶憑證，這裡的 credential 會覆蓋其他配置
      credential: process.env.NODE_ENV !== 'development' ? admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // privateKey 必須是有效的 PEM 格式金鑰，
        // 在環境變數中儲存時，需要將 JSON 中的 \\n 轉換為實際的換行符
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n'),
      }) : undefined, // 開發模式下不提供憑證，依賴環境變數自動連接模擬器
    });

    console.log(`Firebase Admin SDK initialized for ${process.env.NODE_ENV} mode.`);
    if (process.env.NODE_ENV === 'development') {
         console.log('Expecting to connect to emulators based on environment variables.');
         console.log('FIREBASE_AUTH_EMULATOR_HOST:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
         console.log('FIREBASE_FIRESTORE_EMULATOR_HOST:', process.env.FIREBASE_FIRESTORE_EMULATOR_HOST);
    }


    // 獲取並導出 Firestore 和 Auth 實例
    firestore = admin.firestore();
    auth = admin.auth();

  } catch (error: any) {
    console.error('Firebase admin initialization error:', error);
    // 根據應用需求，這裡可以選擇重新拋出錯誤或提供一個錯誤處理機制
    // 例如，如果初始化失敗，應用程式可能無法正常運行
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
