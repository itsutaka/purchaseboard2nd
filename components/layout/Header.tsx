import { Box, Flex, Button, Heading, Spacer, HStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function Header() {
  return (
    <Box as="header" bg="blue.600" px={4} py={3} color="white">
      <Flex align="center" maxW="container.xl" mx="auto">
        <Link href="/" passHref>
          <Heading size="md" cursor="pointer">購物訂單追蹤</Heading>
        </Link>
        <Spacer />
        <HStack spacing={4}>
          <Link href="/dashboard" passHref>
            <Button variant="ghost" colorScheme="whiteAlpha">儀表板</Button>
          </Link>
          <Link href="/orders" passHref>
            <Button variant="ghost" colorScheme="whiteAlpha">訂單</Button>
          </Link>
          <Link href="/auth/signin" passHref>
            <Button colorScheme="whiteAlpha" variant="outline">登入</Button>
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
