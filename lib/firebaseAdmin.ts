import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // --- 在開發模式下連接到模擬器 ---
    if (process.env.NODE_ENV === 'development') {
      console.log('Initializing Firebase Admin SDK for Emulators...');
      // Admin SDK 連接模擬器需要提供模擬器的 HOST:PORT
      // 這裡的連接是自動的，依賴環境變數 FIREBASE_AUTH_EMULATOR_HOST 和 FIREBASE_FIRESTORE_EMULATOR_HOST
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // 專案 ID 仍然需要，但數據會儲存在模擬器
      });

      // Firebase Auth 模擬器通常運行在 9099 端口
      // admin.auth().useEmulator('http://localhost:9099'); // 已移除
      // Firestore 模擬器通常運行在 8080 端口
      // admin.firestore().useEmulator('localhost', 8081); // 已移除
      // 如果使用了其他 Admin SDK 服務並模擬，也要在這裡連接
      // admin.storage().useEmulator('localhost', 9199);
      // admin.database().useEmulator('localhost', 9000);

    } else {
      // --- 在生產模式下連接到實際的 Firebase 專案 ---
      console.log('Initializing Firebase Admin SDK for Production...');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // privateKey 必須是有效的 PEM 格式金鑰，
          // 在環境變數中儲存時，需要將 JSON 中的 \\n 轉換為實際的換行符
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n'),
        }),
        // 如果你的 Firestore 資料庫 URL 不是預設的，可以在這裡指定
        // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com` (這是 Realtime Database 的格式)
        // Firestore 通常不需要 databaseURL
      });
    }
    // console.log('Firebase Admin SDK initialized successfully.'); // 避免重複 log
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error);
    // 在開發環境中，如果服務帳戶配置錯誤，可能會在這裡中斷
    // 在生產環境中，確保環境變數設置正確
  }
}

// 導出常用的服務實例
export const firestore = admin.firestore();
export const auth = admin.auth(); // 用於後端驗證 ID Token
export default admin; // 如果需要其他 Admin SDK 功能

// 獲取 Auth 服務的函數 (確保在 useEmulator() 之後獲取)
export function getFirebaseAuth() {
  return admin.auth();
}

// 獲取 Firestore 服務的函數 (確保在 useEmulator() 之後獲取)
export function getFirestoreDatabase() {
  return admin.firestore();
}

// 考慮將導出改為使用這些函數，確保在連接模擬器後才獲取實例
// export const firestore = getFirestoreDatabase();
// export const const auth = getFirebaseAuth();
// (不過在單例初始化模式下，直接導出實例通常是安全的，因為初始化只執行一次)
