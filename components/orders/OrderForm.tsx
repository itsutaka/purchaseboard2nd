'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  FormErrorMessage,
  useToast,
  Heading,
  Spinner,
  Center,
  Text
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type OrderFormData = {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  quantity: number;
  url?: string;
};

export default function OrderForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { user:currentUser, loading: authLoading } = useAuth();

  console.log("OrderForm Render - authLoading:", authLoading, "currentUser:", currentUser);

  const onSubmit = async (data: OrderFormData) => {
    if (authLoading) {
        console.log("onSubmit - 認證狀態仍在載入中");
        toast({
            title: '請稍候',
            description: '正在確認用戶狀態...',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
        return;
    }
    if (!currentUser) {
        console.log("onSubmit - 使用者未登入");
        toast({
            title: '錯誤',
            description: '請登入以建立訂單',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setLoading(true);
    try {
      const idToken = await currentUser.getIdToken();

      console.log("OrderForm: Acquired ID Token:", idToken);
      if (!idToken) {
         console.error("OrderForm: Failed to acquire ID Token.");
         toast({
             title: '錯誤',
             description: '獲取用戶認證信息失敗，請稍後重試。',
             status: 'error',
             duration: 3000,
             isClosable: true,
         });
         setLoading(false);
         return;
      }

      const orderData = {
        ...data,
        userId: currentUser.uid,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      console.log("準備提交的訂單資料:", orderData);

      await axios.post('/api/orders', orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      toast({
        title: '訂單已建立',
        description: '您的購物請求已成功提交',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/orders');

    } catch (error: unknown) {
      console.error('OrderForm: Error submitting order:', error);
       if (axios.isAxiosError(error)) {
           if (error.response?.status === 401) {
               console.error("OrderForm: API returned 401 Unauthorized. Message:", error.response.data?.message);
               toast({
                 title: '提交失敗',
                 description: error.response.data?.message || '未授權操作，請重新登入。',
                 status: 'error',
                 duration: 5000,
                 isClosable: true,
               });
           } else {
               toast({
                 title: '提交失敗',
                 description: error.response?.data?.message || '建立訂單時發生錯誤，請稍後再試',
                 status: 'error',
                 duration: 5000,
                 isClosable: true,
               });
           }
       } else {
           toast({
             title: '提交失敗',
             description: '發生未知錯誤。',
             status: 'error',
             duration: 5000,
             isClosable: true,
           });
       }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
      console.log("OrderForm - 顯示 Spinner");
      return (
         <Center h="300px">
           <Spinner size="xl" />
         </Center>
      );
  }

  if (!currentUser) {
      console.log("OrderForm - 顯示登入提示");
      return (
         <Center h="300px">
            <Text>請登入以建立新的購物請求。</Text>
         </Center>
      );
  }

  return (
    <Box maxW="md" mx="auto" py={10}>
       <Heading mb={6}>建立購物請求</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4}>
          <FormControl isInvalid={!!errors.title} isRequired>
            <FormLabel>標題</FormLabel>
            <Input
              {...register('title', { required: '請輸入標題' })}
              placeholder="例如：新筆記型電腦"
            />
            <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
          </FormControl>

           <FormControl isInvalid={!!errors.description} isRequired>
            <FormLabel>描述</FormLabel>
            <Textarea
              {...register('description', { required: '請輸入描述' })}
              placeholder="請提供詳細的描述，例如型號、規格等"
            />
             <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.priority} isRequired>
            <FormLabel>優先級</FormLabel>
            <Select {...register('priority', { required: '請選擇優先級' })}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </Select>
            <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.quantity} isRequired>
            <FormLabel>數量</FormLabel>
            <NumberInput min={1} defaultValue={1}>
              <NumberInputField
                {...register('quantity', {
                  required: '請輸入數量',
                  min: { value: 1, message: '數量必須至少為 1' },
                  valueAsNumber: true,
                })}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.url}>
            <FormLabel>產品連結 (選填)</FormLabel>
            <Input
              {...register('url')}
              placeholder="例如：https://www.example.com/product"
            />
            <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
          </FormControl>

          <Button
            colorScheme="blue"
            type="submit"
            isLoading={loading}
            width="full"
            mt={4}
          >
            提交購物請求
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
