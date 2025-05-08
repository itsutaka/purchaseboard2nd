import { Heading, Box } from '@chakra-ui/react';
import OrderForm from '@/components/orders/OrderForm';

export default function CreateOrderPage() {
  return (
    <Box maxW="container.xl" mx="auto">
      <Heading mb={6} textAlign="center">建立購物請求</Heading>
      <OrderForm />
    </Box>
  );
}
