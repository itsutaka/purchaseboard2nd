'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { authClient, firestoreClient } from '@/lib/firebaseClient'; // 引入客戶端 auth 實例
import { doc, getDoc } from 'firebase/firestore'; // 引入 Firestore 讀取方法

interface AuthContextType {
  user: User | null;
  loading: boolean; // 表示正在檢查認證狀態
  userData: any | null; // Firestore 中的用戶文件數據
  isAdmin: boolean; // 根據 userData 判斷是否為管理員
  isStaff: boolean; // 根據 userData 判斷是否為員工
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading as true
  const [userData, setUserData] = useState<any | null>(null); // Firestore 用戶數據

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authClient, async (firebaseUser) => {
      setUser(firebaseUser); // Update Firebase Auth user state

      if (firebaseUser) {
        // If user is logged in, try to fetch user document data from Firestore
        try {
          const userDocRef = doc(firestoreClient, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data()); // Store Firestore user data
          } else {
            console.warn("User document not found in Firestore for UID:", firebaseUser.uid);
            setUserData(null); // User document does not exist
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setUserData(null);
        } finally {
          // Set loading to false AFTER user data fetch attempts
          setLoading(false);
        }
      } else {
        // User logged out, clear user data
        setUserData(null);
        // Set loading to false when no user is logged in
        setLoading(false);
      }
    });

    // Initialize loading to true when the component mounts
    setLoading(true); // Ensure loading is true on mount

    return () => unsubscribe(); // Clean up the listener
  }, []); // Dependency array is empty, runs once on mount

  // 根據 userData 判斷角色
  const isAdmin = userData?.role === 'admin';
  const isStaff = userData?.role === 'staff' || isAdmin; // Admin 也是 Staff

  return (
    <AuthContext.Provider value={{ user, loading, userData, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
