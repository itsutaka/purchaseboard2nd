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
  Stack,
  Tag,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

type Order = {
  _id: string;
  title: string;
  status: 'pending' | 'approved' | 'purchased' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  requestedBy: {
    name: string;
  };
  quantity: number;
  createdAt: string;
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  return (
    <Box>
      <Flex justify="space-between" mb={4} align="center">
        <Text fontSize="lg" fontWeight="medium">共 {filteredOrders.length} 筆訂單</Text>
        <Stack direction={['column', 'row']} spacing={4}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            width="200px"
          >
            <option value="all">所有狀態</option>
            <option value="pending">待審核</option>
            <option value="approved">已批准</option>
            <option value="purchased">已購買</option>
            <option value="delivered">已送達</option>
          </Select>
          <Link href="/orders/create" passHref>
            <Button colorScheme="blue">新增訂單</Button>
          </Link>
        </Stack>
      </Flex>

      {loading ? (
        <Text>載入中...</Text>
      ) : filteredOrders.length === 0 ? (
        <Text textAlign="center" py={10}>無符合條件的訂單</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>標題</Th>
                <Th>申請人</Th>
                <Th>狀態</Th>
                <Th>優先級</Th>
                <Th>數量</Th>
                <Th>申請日期</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.map((order) => (
                <Tr key={order._id}>
                  <Td fontWeight="medium">{order.title}</Td>
                  <Td>{order.requestedBy?.name || '未知'}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)}>
                      {order.status === 'pending' && '待審核'}
                      {order.status === 'approved' && '已批准'}
                      {order.status === 'purchased' && '已購買'}
                      {order.status === 'delivered' && '已送達'}
                    </Badge>
                  </Td>
                  <Td>
                    <Tag colorScheme={getPriorityColor(order.priority)}>
                      {order.priority === 'high' && '高'}
                      {order.priority === 'medium' && '中'}
                      {order.priority === 'low' && '低'}
                    </Tag>
                  </Td>
                  <Td>{order.quantity}</Td>
                  <Td>{format(new Date(order.createdAt), 'yyyy-MM-dd')}</Td>
                  <Td>
                    <Link href={`/orders/${order._id}`} passHref>
                      <Button size="sm" colorScheme="blue" variant="outline">
                        查看
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
