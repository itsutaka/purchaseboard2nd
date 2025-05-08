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
} from '@chakra-ui/react';
import { useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type OrderDetailsProps = {
  order: {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'purchased' | 'delivered';
    priority: 'low' | 'medium' | 'high';
    requestedBy: {
      name: string;
      email: string;
    };
    quantity: number;
    price?: number;
    url?: string;
    comments: string[];
    createdAt: string;
    updatedAt: string;
  };
  isAdmin?: boolean;
};

export default function OrderDetails({ order, isAdmin = false }: OrderDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [newComment, setNewComment] = useState('');
  const router = useRouter();
  const toast = useToast();

  const updateOrderStatus = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/orders/${order._id}`, {
        status: newStatus,
      });
      toast({
        title: '狀態已更新',
        description: `訂單狀態已更新為 ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: '更新失敗',
        description: '無法更新訂單狀態',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      await axios.post(`/api/orders/${order._id}/comments`, {
        comment: newComment,
      });
      toast({
        title: '評論已添加',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewComment('');
      router.refresh();
    } catch (error) {
      toast({
        title: '添加評論失敗',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '已批准';
      case 'purchased': return '已購買';
      case 'delivered': return '已送達';
      default: return status;
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
      <Flex justifyContent="space-between" alignItems="flex-start" wrap="wrap">
        <Box>
          <Heading size="lg" mb={2}>{order.title}</Heading>
          <Flex gap={2} mb={4} flexWrap="wrap">
            <Badge colorScheme={getStatusColor(order.status)}>
              {formatStatusLabel(order.status)}
            </Badge>
            <Tag colorScheme={getPriorityColor(order.priority)}>
              {order.priority === 'high' ? '高優先級' : 
               order.priority === 'medium' ? '中優先級' : '低優先級'}
            </Tag>
            <Text fontSize="sm" color="gray.500">
              #{order._id.substring(order._id.length - 6)}
            </Text>
          </Flex>
        </Box>

        {isAdmin && (
          <Box>
            <FormControl>
              <FormLabel>更新狀態</FormLabel>
              <HStack>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  width="auto"
                >
                  <option value="pending">待審核</option>
                  <option value="approved">已批准</option>
                  <option value="purchased">已購買</option>
                  <option value="delivered">已送達</option>
                </Select>
                <Button
                  colorScheme="blue"
                  isLoading={loading}
                  onClick={updateOrderStatus}
                >
                  更新
                </Button>
              </HStack>
            </FormControl>
          </Box>
        )}
      </Flex>

      <Divider my={4} />

      <Stack spacing={4}>
        <Box>
          <Text fontWeight="bold">描述</Text>
          <Text>{order.description}</Text>
        </Box>

        <Flex justifyContent="space-between" flexWrap="wrap" gap={4}>
          <Box>
            <Text fontWeight="bold">申請人</Text>
            <Text>{order.requestedBy.name}</Text>
            <Text fontSize="sm" color="gray.500">{order.requestedBy.email}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold">數量</Text>
            <Text>{order.quantity}</Text>
          </Box>

          {order.price && (
            <Box>
              <Text fontWeight="bold">價格</Text>
              <Text>NT$ {order.price.toLocaleString()}</Text>
            </Box>
          )}
        </Flex>

        {order.url && (
          <Box>
            <Text fontWeight="bold">產品連結</Text>
            <ChakraLink href={order.url} color="blue.500" isExternal>
              {order.url}
            </ChakraLink>
          </Box>
        )}

        <Box>
          <Text fontWeight="bold">申請時間</Text>
          <Text>{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</Text>
        </Box>
      </Stack>

      <Divider my={4} />

      <Box>
        <Text fontWeight="bold" mb={2}>評論</Text>
        {order.comments && order.comments.length > 0 ? (
          <Stack divider={<Divider />} spacing={2}>
            {order.comments.map((comment, index) => (
              <Box key={index} p={2}>
                <Text>{comment}</Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <Text color="gray.500">暫無評論</Text>
        )}

        <Box mt={4}>
          <FormControl>
            <FormLabel>添加評論</FormLabel>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="輸入您的評論..."
              rows={3}
            />
          </FormControl>
          <Button
            mt={2}
            colorScheme="blue"
            isLoading={loading}
            onClick={addComment}
            isDisabled={!newComment.trim()}
          >
            添加評論
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
