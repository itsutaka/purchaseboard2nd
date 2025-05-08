import { Box, Heading, Text, Button, Container, Stack } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxW="container.xl">
      <Box textAlign="center" py={10}>
        <Heading as="h1" size="2xl" mb={4}>
          購物訂單追蹤系統
        </Heading>
        <Text fontSize="xl" mb={8}>
          簡單高效地管理購物需求，讓採購變得更簡單
        </Text>
        <Stack direction={['column', 'row']} spacing={4} justify="center">
          <Link href="/orders" passHref>
            <Button colorScheme="blue" size="lg">
              查看訂單
            </Button>
          </Link>
          <Link href="/orders/create" passHref>
            <Button colorScheme="green" size="lg">
              建立訂單
            </Button>
          </Link>
        </Stack>
      </Box>
    </Container>
  );
}
