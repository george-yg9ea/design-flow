'use client';

import './globals.css';
import { ChakraProvider } from '@chakra-ui/react';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import { Box } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <AuthProvider>
            <Navbar />
            <Box pt="72px">
              {children}
            </Box>
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
} 