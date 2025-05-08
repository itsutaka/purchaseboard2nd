import { ChakraProvider } from '@chakra-ui/react';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '購物訂單追蹤應用程式',
  description: '追蹤和管理購物訂單的應用程式',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <ChakraProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </ChakraProvider>
      </body>
    </html>
  );
}
