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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

  const onSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/orders', data);
      toast({
        title: '訂單已建立',
        description: '您的購物請求已成功提交',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/orders');
    } catch (error) {
      toast({
        title: '提交失敗',
        description: '建立訂單時發生錯誤，請稍後再試',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" p={5} borderWidth="1px" borderRadius="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4}>
          <FormControl isInvalid={!!errors.title} isRequired>
            <FormLabel>標題</FormLabel>
            <Input
              {...register('title', { required: '請輸入商品標題' })}
              placeholder="請輸入您想購買的物品"
            />
            <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.description} isRequired>
            <FormLabel>描述</FormLabel>
            <Textarea
              {...register('description', { required: '請提供商品描述' })}
              placeholder="請詳細描述您需要的物品（規格、型號等）"
              rows={4}
            />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.priority} isRequired>
            <FormLabel>優先級</FormLabel>
            <Select {...register('priority', { required: '請選擇優先級' })}>
              <option value="low">低</option>
              <option value="medium" selected>
                中
              </option>
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
