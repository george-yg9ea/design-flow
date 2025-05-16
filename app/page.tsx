'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { getProjects, type Project } from './lib/db';

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        toast({
          title: 'Error loading projects',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [user, toast]);

  if (!user) {
    return (
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Heading size="lg" mb={4} color={textColor}>
              Welcome to DesignSoul
            </Heading>
            <Text color={textColor} mb={6}>
              Sign in to view and manage your design projects
            </Text>
            <Button
              onClick={() => router.push('/auth')}
              variant="outline"
              borderColor={borderColor}
              color={textColor}
            >
              Sign In
            </Button>
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8} align="stretch">
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          pb={6}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <Heading 
            size="xl" 
            fontWeight="medium"
            color={useColorModeValue('gray.700', 'gray.100')}
          >
            Projects
          </Heading>
          <Button 
            variant="outline"
            borderWidth="1px"
            color={textColor}
            bg={cardBg}
            onClick={() => router.push('/new')}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          >
            New Project
          </Button>
        </Box>

        {loading ? (
          <Box py={8} textAlign="center" color={textColor}>
            <Text>Loading projects...</Text>
          </Box>
        ) : projects.length === 0 ? (
          <Box py={8} textAlign="center" color={textColor}>
            <Text mb={4}>No projects yet.</Text>
            <Text>Click the "New Project" button to create your first project.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={1} spacing={6}>
            {projects.map((project) => (
              <Card
                key={project.id}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                boxShadow="none"
                cursor="pointer"
                onClick={() => router.push(`/project/${project.id}`)}
                _hover={{
                  borderColor: useColorModeValue('gray.300', 'gray.500'),
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardBody>
                  <Heading 
                    size="md" 
                    mb={3}
                    fontWeight="medium"
                    color={useColorModeValue('gray.700', 'gray.100')}
                  >
                    {project.title}
                  </Heading>
                  <Text color={textColor} fontSize="sm">
                    {project.description}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
} 