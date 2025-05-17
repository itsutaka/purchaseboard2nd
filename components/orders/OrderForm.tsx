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
  priority: 'low' | 'medium' | 'high';
  quantity: number;
  url?: string;
};

export default function OrderForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const onSubmit = async (data: OrderFormData) => {
    if (!user) {
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
      const idToken = await user.getIdToken();

      const response = await axios.post('/api/orders', data, {
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${idToken}`,
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

    } catch (error: any) {
      console.error('Error submitting order:', error);
       const errorMessage = error.response?.data?.message || '建立訂單時發生錯誤，請稍後再試';
      toast({
        title: '提交失敗',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
      return (
         <Center h="300px">
           <Spinner size="xl" />
         </Center>
      );
  }

  if (!user) {
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
              placeholder="https://example.com/product"
              type="url"
            />
            <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
          </FormControl>

          <Button
            mt={4}
            colorScheme="blue"
            isLoading={loading}
            type="submit"
            width="full"
          >
            提交購物請求
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
