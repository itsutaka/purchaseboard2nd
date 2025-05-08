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
    
    try {
      setLoading(true);
      setError('');
      
      // 模擬註冊成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '註冊成功',
        description: '您的帳號已成功建立',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/auth/signin');
    } catch (err) {
      setError('註冊時發生錯誤');
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
                    placeholder="至少 8 個字元"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>部門</FormLabel>
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
                <Link href="/auth/signin">
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
