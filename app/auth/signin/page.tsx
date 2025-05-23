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
} from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/firebaseClient'; // 引入客戶端 auth 實例
import { signInWithEmailAndPassword } from 'firebase/auth'; // 引入 Firebase 登入方法

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(authClient, email, password);
      console.log("Signin successful:", userCredential.user.uid);
      
      toast({
        title: "登入成功",
        description: "歡迎回來！",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error("Signin error:", err);
      
      if (err && typeof err === 'object') {
        const firebaseError = err as { code?: string; message?: string };
        let errorMessage = '登入時發生錯誤';
        
        if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = '電子郵件格式不正確';
        } else if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
          errorMessage = '電子郵件或密碼錯誤';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = '登入嘗試次數過多，請稍後再試';
        } else {
          errorMessage = firebaseError.message || '登入時發生錯誤';
        }

        setError(errorMessage);
        
        toast({
          title: "登入失敗",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        const errorMessage = '登入時發生未知錯誤';
        setError(errorMessage);
        
        toast({
          title: "登入失敗",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
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
              <Heading size="lg">登入</Heading>
              <Text mt={2} color="gray.600">
                登入您的帳號以使用購物訂單追蹤系統
              </Text>
            </Box>
            
            <form onSubmit={handleSignIn}>
              <Stack spacing={4}>
                <FormControl isRequired isInvalid={!!error}>
                  <FormLabel>電子郵件</FormLabel>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                
                <FormControl isRequired isInvalid={!!error}>
                  <FormLabel>密碼</FormLabel>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <FormErrorMessage>{error}</FormErrorMessage>}
                </FormControl>
                
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={loading}
                  width="full"
                  mt={4}
                >
                  登入
                </Button>
              </Stack>
            </form>
            
            <Divider />
            
            <Box textAlign="center">
              <Text>還沒有帳號？ {" "}
                <Link href="/auth/signup" legacyBehavior>
                  <ChakraLink color="blue.500">
                    註冊
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
