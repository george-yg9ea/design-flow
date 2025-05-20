'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../lib/db';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.id);
        if (profile?.name) {
          setName(profile.name);
        }
      } catch (error) {
        toast({
          title: 'Error loading profile',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.id, { name: name.trim() });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

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
              Profile Settings
            </Heading>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color={textColor}>Email</FormLabel>
                  <Input
                    type="email"
                    value={user.email || ''}
                    isReadOnly
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textColor}>Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderColor={borderColor}
                  />
                </FormControl>

                <Button
                  type="submit"
                  isLoading={saving}
                  w="100%"
                  variant="outline"
                  borderWidth="1px"
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                  }}
                >
                  Save Changes
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 