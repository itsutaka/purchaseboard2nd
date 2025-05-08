import { Box, Center, Spinner, Text } from '@chakra-ui/react';
import OrderDetails from '@/components/orders/OrderDetails';
import { notFound } from 'next/navigation';

// 這個函數會在伺服器端執行，從資料庫獲取訂單詳情
async function getOrder(id: string) {
  try {
    // 實際實現中，應該使用 fetch 或直接從資料庫查詢
    // 這裡只是模擬數據
    return {
      _id: id,
      title: '筆記型電腦',
      description: 'Apple MacBook Pro 14" M3 Pro, 16GB RAM, 512GB SSD',
      status: 'pending',
      priority: 'high',
      requestedBy: {
        name: '張小明',
        email: 'ming@example.com',
      },
      quantity: 1,
      price: 52900,
      url: 'https://www.apple.com/tw/macbook-pro/',
      comments: [
        '已聯繫供應商，預計下週到貨。',
        '請確認是否需要加購AppleCare+？',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

// 這是訂單詳情頁面的主元件
export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  // 在實際應用中，可以根據用戶角色來決定是否顯示管理員功能
  const isAdmin = true; // 模擬管理員身分

  return (
    <Box maxW="container.xl" mx="auto">
      <OrderDetails order={order} isAdmin={isAdmin} />
    </Box>
  );
}
