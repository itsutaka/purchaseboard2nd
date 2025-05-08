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

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('請填寫所有欄位');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 模擬登入成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '登入成功',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      router.push('/dashboard');
    } catch (err) {
      setError('電子郵件或密碼不正確');
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
                <Link href="/auth/signup">
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
