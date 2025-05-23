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
  useToast,
  Card,
  CardBody,
  Divider,
  Link as ChakraLink,
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';
// import Link from 'next/link'; // 已移除未使用
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/firebaseClient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import NextLink from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError('請填寫所有必填欄位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(authClient, email, password);
      const user = userCredential.user;

      console.log("Firebase Auth User created:", user);
      if (!user) {
        console.error("User object is null after signup!");
        setError("註冊成功，但無法獲取用戶資訊，請稍後重試或聯繫管理員。");
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();

      console.log("Acquired ID Token:", idToken);

      const requestHeaders = {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      };
      console.log("Sending headers to /api/users:", requestHeaders);

      await axios.post('/api/users', {
        name: name,
        department: department,
      }, {
        headers: requestHeaders
      });

      toast({
        title: '註冊成功',
        description: '您的帳號已成功建立',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/auth/signin');
    } catch (err: unknown) {
      console.error("Signup process error:", err);
      if (err && typeof err === 'object' && 'code' in err) {
        if (err.code === 'auth/email-already-in-use') {
          setError('電子郵件已被註冊');
        } else if (err.code === 'auth/weak-password') {
          setError('密碼強度不足，請至少輸入 6 個字元');
        }
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError('註冊後建立用戶文件失敗: ' + err.response.data.message);
      } else {
        setError('註冊時發生錯誤: ' + (err as Error).message);
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
                    placeholder="至少 6 個字元"
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
              <Text>已有帳號？{" "}
                <ChakraLink as={NextLink} href="/auth/signin" color="blue.500">
                  登入
                </ChakraLink>
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
