import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // privateKey 必須是有效的 PEM 格式金鑰，
        // 在環境變數中儲存時，需要將 JSON 中的 \n 轉換為實際的換行符
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      // 如果你的 Firestore 資料庫 URL 不是預設的，可以在這裡指定
      // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com` (這是 Realtime Database 的格式)
      // Firestore 通常不需要 databaseURL
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth(); // 如果你需要 Firebase Authentication
export default admin;
