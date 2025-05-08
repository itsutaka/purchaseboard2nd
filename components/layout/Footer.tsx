import { Box, Text, Center } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" bg="gray.100" py={4}>
      <Center>
        <Text color="gray.500">
          © {new Date().getFullYear()} 購物訂單追蹤系統
        </Text>
      </Center>
    </Box>
  );
}
