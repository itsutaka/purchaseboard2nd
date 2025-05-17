'use client';

import { Box, Flex, Button, Heading, Spacer, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { authClient } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authClient, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(authClient);
      router.push('/auth/signin');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Box as="header" bg="blue.600" px={4} py={3} color="white">
      <Flex align="center" maxW="container.xl" mx="auto">
        <Link href="/" passHref>
          <Heading size="md" cursor="pointer">購物訂單追蹤</Heading>
        </Link>
        <Spacer />
        <HStack spacing={4}>
          {user ? (
            <>
              <Link href="/dashboard" passHref>
                <Button variant="ghost" colorScheme="whiteAlpha">儀表板</Button>
              </Link>
              <Link href="/orders" passHref>
                <Button variant="ghost" colorScheme="whiteAlpha">訂單</Button>
              </Link>
              <Button colorScheme="whiteAlpha" variant="outline" onClick={handleSignOut}>
                登出
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signup" passHref>
                <Button colorScheme="whiteAlpha" variant="outline">註冊</Button>
              </Link>
              <Link href="/auth/signin" passHref>
                <Button colorScheme="whiteAlpha" variant="outline">登入</Button>
              </Link>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
