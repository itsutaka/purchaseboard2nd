'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Text,
  Flex,
  Select,
  Tag,
  Spinner,
  Center,
  Heading,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

type Order = {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'purchased' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  requestedBy: {
    userId: string;
    name: string;
    email: string;
  };
  quantity: number;
  createdAt: string;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, loading: authLoading, isAdmin, isStaff } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading || !user) {
        setLoading(false);
        setOrders([]);
        return;
      }

      try {
        setLoading(true);
        const idToken = await user.getIdToken();

        const apiEndpoint = '/api/orders';
        if (!isAdmin && !isStaff) {
            console.log("Fetching orders for regular user (backend should filter by UID)");
        } else {
             console.log("Fetching all orders for Staff/Admin");
        }

        const response = await axios.get(apiEndpoint, {
           headers: {
             'Authorization': `Bearer ${idToken}`,
           },
        });

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
       fetchOrders();
    }

  }, [user, authLoading, isAdmin, isStaff]);

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

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

  if (!authLoading && !user) {
    return (
      <Center h="200px">
        <Text>請登入以查看購物請求。</Text>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading mb={6}>購物請求列表</Heading>
        <Select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           width="auto"
           minW="150px"
        >
           <option value="all">所有狀態</option>
           <option value="pending">待審核</option>
           <option value="approved">已批准</option>
           <option value="purchased">已購買</option>
           <option value="delivered">已送達</option>
        </Select>
      </Flex>

      {filteredOrders.length === 0 ? (
         <Box textAlign="center" py={10}>
           <Text fontSize="xl" color="gray.500">
             {statusFilter === 'all' ? '目前沒有購物請求。' : `在狀態 "${statusFilter}" 下沒有購物請求。`}
           </Text>
           {user && (
             <Link href="/orders/create" passHref>
               <Button mt={4} colorScheme="blue">
                 建立新的購物請求
               </Button>
             </Link>
           )}
         </Box>
      ) : (
         <Table variant="simple">
           <Thead>
             <Tr>
               <Th>標題</Th>
               <Th>申請人</Th>
               <Th>數量</Th>
               <Th>優先級</Th>
               <Th>狀態</Th>
               <Th>建立時間</Th>
               <Th>操作</Th>
             </Tr>
           </Thead>
           <Tbody>
             {filteredOrders.map((order) => (
               <Tr key={order.id}>
                 <Td>{order.title}</Td>
                 <Td>{order.requestedBy.name}</Td>
                 <Td>{order.quantity}</Td>
                 <Td>
                   <Tag size="sm" colorScheme={getPriorityColor(order.priority)}>
                     {order.priority}
                   </Tag>
                 </Td>
                 <Td>
                   <Badge colorScheme={getStatusColor(order.status)}>
                     {order.status}
                   </Badge>
                 </Td>
                 <Td>{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</Td>
                 <Td>
                   <Link href={`/orders/${order.id}`} passHref>
                     <Button size="sm" colorScheme="blue" variant="outline">
                       查看詳情
                     </Button>
                   </Link>
                 </Td>
               </Tr>
             ))}
           </Tbody>
         </Table>
      )}
    </Box>
  );
}
