import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'; // 如果前端需要直接存取 Firestore
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
let app;
try {
  app = getApp();
} catch (e) {
  app = initializeApp(firebaseConfig);
}

const authClient = getAuth(app);
const firestoreClient = getFirestore(app); // 如果前端需要直接存取 Firestore
// const firestoreClient = getFirestore(app); // 如果需要客戶端 Firestore

// --- 在開發模式下連接到模擬器 ---
if (process.env.NODE_ENV === 'development') {
  console.log('Connecting to Firebase Emulators...');
  // Auth 模擬器通常運行在 9099 端口
  try {
    connectAuthEmulator(authClient, "http://localhost:9099");
  } catch (e) {
    console.warn("Auth emulator already connected or failed to connect:", e);
  }
  // Firestore 模擬器通常運行在你 firebase.json 中設定的端口 (例如 8081)
  try {
    connectFirestoreEmulator(firestoreClient, "localhost", 8081);
  } catch (e) {
    console.warn("Firestore emulator already connected or failed to connect:", e);
  }
  // 如果你還使用了其他 Firebase 服務並啟用了模擬器，也要在這裡連接
  // connectStorageEmulator(storageClient, "localhost", 9199);
  // connectFunctionsEmulator(functionsClient, "localhost", 5001);
}
// --- 結束模擬器連線設定 ---

export { app, authClient, firestoreClient };
