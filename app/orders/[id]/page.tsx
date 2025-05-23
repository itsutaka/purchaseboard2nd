// app/orders/[id]/page.tsx
import { Box } from '@chakra-ui/react';
import OrderDetails from '@/components/orders/OrderDetails';
import { notFound } from 'next/navigation';

// 定義 OrderDetails 元件的 order prop 所期望的資料結構類型
interface OrderDetailPropsOrder {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "purchased" | "delivered";
  priority: "low" | "medium" | "high";
  requestedBy: {
    userId: string;
    name: string;
    email: string;
  };
  quantity: number;
  price: number;
  url: string;
  comments: Array<{
    text: string;
    authorId: string;
    authorName: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 這個函數會在伺服器端執行，從資料庫獲取訂單詳情
async function getOrder(id: string): Promise<OrderDetailPropsOrder | null> {
  try {
    // 實際實現中，應該使用 fetch 或直接從資料庫查詢
    // 這裡只是模擬數據，並確保其類型符合 OrderDetailPropsOrder
    return {
      id: id,
      title: '筆記型電腦',
      description: 'Apple MacBook Pro 14" M3 Pro, 16GB RAM, 512GB SSD',
      status: 'pending',
      priority: 'high',
      requestedBy: {
        userId: 'mock-user-id-123',
        name: '張小明',
        email: 'ming@example.com',
      },
      quantity: 1,
      price: 52900,
      url: 'https://www.apple.com/tw/macbook-pro/',
      comments: [
        {
          text: '已聯繫供應商，預計下週到貨。',
          authorId: 'admin1',
          authorName: '管理員A',
          createdAt: new Date().toISOString(),
        },
        {
          text: '請確認是否需要加購AppleCare+？',
          authorId: 'user1',
          authorName: '張小明',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

// 這是訂單詳情頁面的主元件
export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  // 因為 OrderDetails 元件內部已處理 isAdmin 邏輯，所以這裡的 isAdmin 模擬和傳遞是多餘的。
  // const isAdmin = true; // 移除或註銷此行

  return (
    <Box maxW="container.xl" mx="auto">
      {/* <-- 這裡移除 isAdmin prop --> */}
      <OrderDetails order={order} />
    </Box>
  );
}