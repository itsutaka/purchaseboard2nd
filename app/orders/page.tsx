import { Heading, Box } from '@chakra-ui/react';
import OrderList from '@/components/orders/OrderList';

export default function OrdersPage() {
  return (
    <Box maxW="container.xl" mx="auto">
      <Heading mb={6}>購物請求列表</Heading>
      <OrderList />
    </Box>
  );
}
