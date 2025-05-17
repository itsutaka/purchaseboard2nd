'use client'; // 將頁面標記為 Client Component

import {
  Box,
  Heading,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Flex,
  Badge,
  Progress,
  Stack,
  IconButton,
  Button,
  StatArrow,
  StatGroup,
  Spinner,
  Center,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // 引入 useAuth hook
import { format } from 'date-fns'; // 可能需要處理日期格式

// 在實際應用中，這些數據應該從後端獲取
const dashboardData = {
  stats: {
    totalOrders: 42,
    pendingOrders: 15,
    completedOrders: 27,
    completionRate: 64,
  },
  recentOrders: [
    {
      id: '1',
      title: '筆記型電腦',
      requestedBy: '張小明',
      status: 'pending',
      date: '2023-09-15',
    },
    {
      id: '2',
      title: '顯示器',
      requestedBy: '李大方',
      status: 'approved',
      date: '2023-09-14',
    },
    {
      id: '3',
      title: '無線滑鼠',
      requestedBy: '王小華',
      status: 'delivered',
      date: '2023-09-13',
    },
  ],
};

export default function DashboardPage() {
  const { user, loading, userData, isAdmin, isStaff } = useAuth(); // 使用 useAuth hook
  const { stats, recentOrders } = dashboardData;

  // 在這裡獲取儀表板數據。在真實應用中，這會是一個 useEffect 或其他數據 fetching 邏輯，
  // 並且會根據 user 的狀態和角色來決定獲取哪些數據。
  // 這裡我們繼續使用模擬數據，但根據角色顯示不同的統計資訊。
  const statsToShow = isAdmin || isStaff ? stats : { // 非 Staff/Admin 只顯示與自己相關的統計
    totalOrders: stats.totalOrders, // 假設一般用戶也可以看到總數
    pendingOrders: stats.pendingOrders, // 顯示自己的待處理訂單
    // 其他統計可能不顯示或顯示與自己相關的
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'blue';
      case 'purchased': return 'purple';
      case 'delivered': return 'green';
      default: return 'gray';
    }
  };

  // 格式化狀態標籤
  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待審核';
      case 'approved': return '已批准';
      case 'purchased': return '已購買';
      case 'delivered': return '已送達';
      default: return status;
    }
  };

  // 處理載入狀態
  if (loading) {
    return (
      <Center h="300px">
        <Spinner size="xl" />
      </Center>
    );
  }

  // 處理用戶未登入狀態
  if (!user) {
    return (
      <Center h="300px">
        <Box textAlign="center">
          <Heading size="lg">需要登入</Heading>
          <Text mt={2} color="gray.600">
            請登入您的帳號以查看儀表板內容。
          </Text>
           <Link href="/auth/signin" passHref>
             <Button mt={4} colorScheme="blue">
               前往登入
             </Button>
           </Link>
        </Box>
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>儀表板</Heading>
        <Link href="/orders/create" passHref>
          <Button colorScheme="blue">建立訂單</Button>
        </Link>
      </Flex>

      {/* 歡迎訊息，可以包含用戶名稱 */}
      <Box mb={8}>
          <Heading size="md">歡迎, {userData?.name || user.email}!</Heading> {/* 使用 userData.name 或 user.email */}
           {/* 顯示角色標籤 */}
           {isAdmin ? (
               <Badge ml={2} colorScheme="purple">管理員</Badge>
           ) : isStaff ? (
               <Badge ml={2} colorScheme="teal">員工</Badge>
           ) : (
               <Badge ml={2} colorScheme="gray">用戶</Badge>
           )}
      </Box>

      {/* 統計信息 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>總訂單數</StatLabel>
              <StatNumber>{statsToShow.totalOrders}</StatNumber>
              <StatHelpText>所有採購請求</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>待處理訂單</StatLabel>
              <StatNumber>{statsToShow.pendingOrders}</StatNumber>
              <StatHelpText>需要審核的請求</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>已完成訂單</StatLabel>
              <StatNumber>{stats.completedOrders}</StatNumber>
              <StatHelpText>已交付的採購</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>完成率</StatLabel>
              <StatNumber>{stats.completionRate}%</StatNumber>
              <Progress value={stats.completionRate} colorScheme="green" size="sm" mt={2} />
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 最近訂單 */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">最近訂單</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<Box borderBottomWidth="1px" />} spacing={4}>
            {/* 在真實應用中，這裡只顯示與當前用戶相關的最近訂單，或者 Staff/Admin 看到所有 */}
            {/* 這裡繼續使用模擬數據，但可以根據角色過濾 */}
            {recentOrders
               // 根據角色過濾：如果是普通用戶，只顯示 requestedBy 是自己的訂單 (假設 requestedBy 是用戶姓名)
               // 在 Firestore 模型中 requestedBy 是一個物件 { userId, name, email }，所以過濾應該基於 userId
               .filter(order => isAdmin || isStaff || (userData && order.requestedBy === userData.name)) // 這裡的過濾邏輯需要根據真實數據源調整
               .map((order) => (
              <Flex key={order.id} justify="space-between" align="center">
                <Box>
                  <Link href={`/orders/${order.id}`} passHref>
                    <Text fontWeight="semibold" _hover={{ color: 'blue.500' }} cursor="pointer">
                      {order.title}
                    </Text>
                  </Link>
                  <Text fontSize="sm" color="gray.500">
                    申請人: {order.requestedBy} • {format(new Date(order.date), 'yyyy-MM-dd HH:mm')} {/* 格式化日期 */}
                  </Text>
                </Box>
                <Badge colorScheme={getStatusColor(order.status)}>
                  {formatStatusLabel(order.status)}
                </Badge>
              </Flex>
            ))}
          </Stack>
          <Box mt={4} textAlign="center">
            <Link href="/orders" passHref>
              <Button variant="outline" size="sm">
                查看所有訂單
              </Button>
            </Link>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
