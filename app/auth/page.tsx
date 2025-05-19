'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.push('/');
    }
  }, [mounted, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: 'Account created.',
          description: 'Please check your email to verify your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Container maxW="container.sm" py={12}>
      <VStack spacing={8}>
        <Box 
          w="100%" 
          p={8} 
          borderRadius="lg" 
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6}>
            <Heading size="lg" color={textColor}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Heading>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor}>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderColor={borderColor}
                  />
                </FormControl>

                <Button
                  type="submit"
                  isLoading={loading}
                  w="100%"
                  variant="outline"
                  borderWidth="1px"
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                  }}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              color={textColor}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 