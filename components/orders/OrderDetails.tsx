'use client';

import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Divider,
  Button,
  Stack,
  Tag,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Link as ChakraLink,
  HStack,
  Input,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type OrderDetailsProps = {
  order: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'purchased' | 'delivered';
    priority: 'low' | 'medium' | 'high';
    requestedBy: {
      userId: string;
      name: string;
      email: string;
    };
    quantity: number;
    price?: number;
    url?: string;
    comments: {
      text: string;
      authorId: string;
      authorName: string;
      createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
  };
};

export default function OrderDetails({ order: initialOrder }: OrderDetailsProps) {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading, isAdmin, isStaff, userData: currentUserData } = useAuth();

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const [newStatus, setNewStatus] = useState(order.status);
  const [newPrice, setNewPrice] = useState(order.price || '');
  const [newUrl, setNewUrl] = useState(order.url || '');
  const [newComment, setNewComment] = useState('');

  if (authLoading || loading) {
    return (
      <Center h="300px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const updateOrderStatus = async () => {
    if (!user) return;

    setUpdateLoading(true);
    try {
      const idToken = await user.getIdToken();

      await axios.patch(`/api/orders/${order.id}`, {
        status: newStatus,
        price: newPrice === '' ? null : Number(newPrice),
        url: newUrl === '' ? null : newUrl,
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      toast({
        title: '狀態已更新',
        description: `訂單狀態已更新為 ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setOrder(prevOrder => ({
        ...prevOrder,
        status: newStatus,
        price: newPrice === '' ? undefined : Number(newPrice),
        url: newUrl === '' ? undefined : newUrl,
        updatedAt: new Date().toISOString(),
      }));

    } catch (error: any) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.message || '無法更新訂單狀態';
      toast({
        title: '更新失敗',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const addComment = async () => {
    if (!user || !newComment.trim()) return;

    setCommentLoading(true);
    try {
      const idToken = await user.getIdToken();

      const response = await axios.post(`/api/orders/${order.id}`, {
        comment: newComment.trim(),
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      toast({
        title: '評論已添加',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setNewComment('');

      const addedComment = {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: currentUserData?.name || user.email || '未知用戶',
        createdAt: new Date().toISOString(),
      };
      setOrder(prevOrder => ({
        ...prevOrder,
        comments: [...(prevOrder.comments || []), addedComment],
        updatedAt: new Date().toISOString(),
      }));

    } catch (error: any) {
      console.error("Error adding comment:", error);
      const errorMessage = error.response?.data?.message || '添加評論失敗';
      toast({
        title: '添加評論失敗',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'blue';
      case 'purchased': return 'purple';
      case 'delivered': return 'green';
      default: return 'gray';
    }
  };

  const showStaffActions = isStaff || isAdmin;

  return (
    <Box maxW="container.xl" mx="auto">
      <Heading mb={4}>{order.title}</Heading>
      <Text fontSize="lg" color="gray.600" mb={4}>
        申請人: {order.requestedBy.name} ({order.requestedBy.email})
      </Text>
      <Flex align="center" mb={4}>
        <Badge colorScheme={getStatusColor(order.status)} fontSize="md" mr={2}>
          {order.status}
        </Badge>
        <Tag size="md" colorScheme={getPriorityColor(order.priority)}>
          {order.priority}
        </Tag>
         {order.price !== undefined && order.price !== null && (
            <Text fontSize="lg" ml={4}>價格: NT$ {order.price.toLocaleString()}</Text>
         )}
      </Flex>
      <Text mb={4}>數量: {order.quantity}</Text>
      {order.url && (
        <Text mb={4}>
          產品連結: {" "}
          <ChakraLink href={order.url} isExternal color="blue.500">
            {order.url}
          </ChakraLink>
        </Text>
      )}
      <Text mb={4}>{order.description}</Text>
      <Text fontSize="sm" color="gray.500" mb={6}>
        建立時間: {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')} • 更新時間: {format(new Date(order.updatedAt), 'yyyy-MM-dd HH:mm')}
      </Text>

      <Divider mb={6} />

      {showStaffActions && (
         <Box mb={8}>
            <Heading size="md" mb={4}>管理操作</Heading>
             <Stack spacing={4}>
                <FormControl id="status">
                  <FormLabel>更新狀態</FormLabel>
                  <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}>
                    <option value="pending">待審核</option>
                    <option value="approved">已批准</option>
                    <option value="purchased">已購買</option>
                    <option value="delivered">已送達</option>
                  </Select>
                </FormControl>
                 <FormControl id="price">
                   <FormLabel>更新價格 (選填)</FormLabel>
                   <Input
                     type="number"
                     value={newPrice}
                     onChange={(e) => setNewPrice(e.target.value)}
                     placeholder="輸入價格"
                   />
                 </FormControl>
                 <FormControl id="url">
                   <FormLabel>更新產品連結 (選填)</FormLabel>
                   <Input
                     type="url"
                     value={newUrl}
                     onChange={(e) => setNewUrl(e.target.value)}
                     placeholder="輸入產品連結"
                   />
                 </FormControl>

                 <Button colorScheme="green" onClick={updateOrderStatus} isLoading={updateLoading}>
                   確認更新
                 </Button>
             </Stack>
         </Box>
      )}

      <Divider mb={6} />

      <Box mb={8}>
        <Heading size="md" mb={4}>評論 ({order.comments?.length || 0})</Heading>
         <Stack spacing={4} mb={4}>
          {order.comments?.map((comment, index) => (
            <Box key={index} p={4} shadow="md" borderWidth="1px">
              <Text fontWeight="bold">{comment.authorName} <Text as="span" fontSize="sm" color="gray.500">({format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')})</Text></Text>
              <Text mt={1}>{comment.text}</Text>
            </Box>
          ))}
           {order.comments?.length === 0 && (
               <Text color="gray.500">目前沒有評論。</Text>
           )}
        </Stack>

         {user && (
            <Box>
                <Textarea
                  placeholder="添加評論..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  mb={2}
                />
                <Button colorScheme="blue" onClick={addComment} isLoading={commentLoading}>
                  添加評論
                </Button>
            </Box>
         )}
          {!user && (
              <Text color="gray.500">請登入以添加評論。</Text>
          )}
      </Box>

    </Box>
  );
}
