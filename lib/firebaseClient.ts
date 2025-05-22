import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'; // 如果前端需要直接存取 Firestore
// 如果客戶端需要直接存取 Firestore，也引入 getFirestore
// import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
// 檢查是否已有 Firebase 應用實例，避免重複初始化
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase Client SDK initialized.');
} else {
  app = getApp();
  console.log('Firebase Client SDK already initialized.');
}

// 獲取 Auth 和 Firestore 實例
const authClient: Auth = getAuth(app);
const firestoreClient: Firestore = getFirestore(app); // 如果前端需要直接存取 Firestore
// const firestoreClient = getFirestore(app); // 如果需要客戶端 Firestore

// 移除了所有連接模擬器的代碼塊
// --- 在開發模式下連接到模擬器 ---
// if (process.env.NODE_ENV === 'development') {
//   console.log('Connecting to Firebase Emulators...');
//   try {
//     connectAuthEmulator(authClient, "http://localhost:9099");
//   } catch (e) {
//     console.warn("Auth emulator already connected or failed to connect:", e);
//   }
//   try {
//     connectFirestoreEmulator(firestoreClient, "localhost", 8081);
//   } catch (e) {
//     console.warn("Firestore emulator already connected or failed to connect:", e);
//   }
// }
// --- 結束模擬器連線設定 ---

export { app, authClient, firestoreClient };
