import {
  Box,
  Container,
  Flex,
  Text,
  Avatar,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <Box 
      as="nav" 
      position="fixed" 
      w="100%" 
      zIndex={1000} 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex py={4} justify="space-between" align="center">
          <Text 
            fontSize="xl" 
            fontWeight="medium" 
            color={textColor}
            cursor="pointer"
            onClick={() => router.push('/')}
            _hover={{
              color: useColorModeValue('gray.900', 'gray.300'),
            }}
          >
            DesignSoul
          </Text>

          {user ? (
            <Menu>
              <MenuButton>
                <Avatar 
                  size="sm" 
                  name={user.email || undefined}
                  cursor="pointer"
                  bg={useColorModeValue('gray.200', 'gray.600')}
                  _hover={{
                    opacity: 0.8,
                  }}
                />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              variant="ghost"
              color={textColor}
              onClick={() => router.push('/auth')}
              size="sm"
            >
              Sign In
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
} 