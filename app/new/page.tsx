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
  Text,
  Checkbox,
  Divider,
  useColorModeValue,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProject } from '../lib/db';
import { designPhases } from '../data/design-phases';

export default function NewProjectPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('You must be signed in to create a project');
      }

      // Group deliverables by phase
      const deliverablesByPhase: Record<string, string[]> = {};
      designPhases.forEach(phase => {
        const phaseDeliverables = phase.deliverables
          .filter(d => selectedDeliverables.includes(d.id))
          .map(d => d.id);
        if (phaseDeliverables.length > 0) {
          deliverablesByPhase[phase.title] = phaseDeliverables;
        }
      });

      await createProject(
        projectName,
        projectDescription || null,
        deliverablesByPhase,
        user.id
      );

      toast({
        title: 'Project created.',
        description: 'Your new project has been created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/');
    } catch (error) {
      toast({
        title: 'Error creating project',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverableToggle = (deliverableId: string) => {
    setSelectedDeliverables(prev => 
      prev.includes(deliverableId)
        ? prev.filter(id => id !== deliverableId)
        : [...prev, deliverableId]
    );
  };

  // Only render content after component is mounted
  if (!mounted) {
    return null;
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={8} as="form" onSubmit={handleSubmit}>
        <Heading size="xl" fontWeight="medium" color={textColor}>
          Create New Project
        </Heading>

        <VStack spacing={6} align="stretch" w="100%">
          <FormControl isRequired>
            <FormLabel color={textColor}>Project Name</FormLabel>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              bg={inputBg}
              borderColor={borderColor}
              placeholder="Enter project name"
            />
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Description</FormLabel>
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              bg={inputBg}
              borderColor={borderColor}
              placeholder="Enter project description"
              rows={4}
            />
          </FormControl>

          <Box>
            <Heading 
              size="md" 
              fontWeight="medium" 
              color={textColor}
              mb={6}
            >
              Select Deliverables
            </Heading>

            <VStack spacing={8} align="stretch">
              {designPhases.map((phase) => (
                <Box 
                  key={phase.title}
                  p={6}
                  bg={sectionBg}
                  borderRadius="md"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" color={textColor} mb={2}>
                    {phase.title}
                  </Heading>
                  <Text color={descriptionColor} mb={4} fontSize="sm">
                    {phase.description}
                  </Text>
                  <Divider mb={4} borderColor={borderColor} />
                  <VStack align="stretch" spacing={3}>
                    {phase.deliverables.map((deliverable) => (
                      <Box key={deliverable.id}>
                        <Checkbox
                          isChecked={selectedDeliverables.includes(deliverable.id)}
                          onChange={() => handleDeliverableToggle(deliverable.id)}
                          colorScheme="gray"
                        >
                          <Text color={textColor} fontWeight="medium">
                            {deliverable.name}
                          </Text>
                        </Checkbox>
                        <Text color={descriptionColor} fontSize="sm" ml={6}>
                          {deliverable.description}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            loadingText="Creating Project..."
            w="100%"
            variant="outline"
            borderWidth="1px"
            borderColor={borderColor}
            color={textColor}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          >
            Create Project
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
} 