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
} from '@chakra-ui/react';
import Link from 'next/link';

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
  const { stats, recentOrders } = dashboardData;

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

  return (
    <Box maxW="container.xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>儀表板</Heading>
        <Link href="/orders/create" passHref>
          <Button colorScheme="blue">建立訂單</Button>
        </Link>
      </Flex>

      {/* 統計信息 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>總訂單數</StatLabel>
              <StatNumber>{stats.totalOrders}</StatNumber>
              <StatHelpText>所有採購請求</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>待處理訂單</StatLabel>
              <StatNumber>{stats.pendingOrders}</StatNumber>
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
            {recentOrders.map((order) => (
              <Flex key={order.id} justify="space-between" align="center">
                <Box>
                  <Link href={`/orders/${order.id}`} passHref>
                    <Text fontWeight="semibold" _hover={{ color: 'blue.500' }} cursor="pointer">
                      {order.title}
                    </Text>
                  </Link>
                  <Text fontSize="sm" color="gray.500">
                    申請人: {order.requestedBy} • {order.date}
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
