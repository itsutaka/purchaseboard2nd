'use client'

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  Divider,
  Link as ChakraLink,
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/firebaseClient'; // 引入客戶端 auth 實例
import { createUserWithEmailAndPassword } from 'firebase/auth'; // 引入 Firebase 註冊方法
import axios from 'axios'; // 用於呼叫後端 API

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('請填寫所有必填欄位');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 1. 使用 Firebase Authentication 建立用戶
      const userCredential = await createUserWithEmailAndPassword(authClient, email, password);
      const user = userCredential.user; // 成功註冊的用戶物件 (包含 uid, email 等)

      // 2. 呼叫後端 API 在 Firestore 中建立對應的用戶文件
      // 我們需要用戶的 UID 和在註冊表單中填寫的其他資訊 (姓名, 部門)
      const idToken = await user.getIdToken(); // 獲取 Firebase ID Token 進行後端驗證

      await axios.post('/api/users', { // 呼叫新的後端 API 路由
        name: name,
        department: department,
        // 注意：email 和 uid 可以從後端驗證 token 後獲取，不需要從前端傳遞
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`, // 將 token 放在 Header 中
          'Content-Type': 'application/json',
        }
      });

      toast({
        title: '註冊成功',
        description: '您的帳號已成功建立',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/auth/signin'); // 註冊成功後導向登入頁

    } catch (err: any) {
      console.error("Signup error:", err);
      // 根據 Firebase Auth 錯誤碼和後端 API 錯誤碼提供友善提示
      if (err.code === 'auth/email-already-in-use') {
        setError('電子郵件已被註冊');
      } else if (err.code === 'auth/weak-password') {
         setError('密碼強度不足，請至少輸入 6 個字元');
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
         // 顯示後端 API 返回的錯誤信息
         setError('註冊後建立用戶文件失敗: ' + err.response.data.message);
         // 考慮：如果後端建立用戶文件失敗，是否需要回滾 Firebase Auth 的註冊？這比較複雜，初期可以先不處理。
      }
      else {
        setError('註冊時發生錯誤: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" py={10}>
      <Card>
        <CardBody>
          <Stack spacing={8}>
            <Box textAlign="center">
              <Heading size="lg">註冊帳號</Heading>
              <Text mt={2} color="gray.600">
                建立您的帳號以使用購物訂單追蹤系統
              </Text>
            </Box>
            
            <form onSubmit={handleSignUp}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>姓名</FormLabel>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="請輸入您的姓名"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>電子郵件</FormLabel>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>密碼</FormLabel>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 個字元" // Firebase Auth 密碼長度要求至少 6 個字元
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>部門 (選填)</FormLabel>
                  <Select 
                    placeholder="選擇您的部門" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="engineering">工程部</option>
                    <option value="marketing">市場行銷部</option>
                    <option value="finance">財務部</option>
                    <option value="hr">人力資源部</option>
                    <option value="operations">營運部</option>
                    <option value="sales">銷售部</option>
                    <option value="it">資訊技術部</option>
                    <option value="customer_service">客戶服務部</option>
                    <option value="research">研究發展部</option>
                    <option value="other">其他</option>
                  </Select>
                </FormControl>
                
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
                
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={loading}
                  width="full"
                  mt={4}
                >
                  註冊
                </Button>
              </Stack>
            </form>
            
            <Divider />
            
            <Box textAlign="center">
              <Text>已有帳號？ {" "}
                <Link href="/auth/signin" passHref>
                  <ChakraLink color="blue.500">
                    登入
                  </ChakraLink>
                </Link>
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
