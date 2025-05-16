'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  useColorModeValue,
  IconButton,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getProject, addProjectDeliverables } from '../../lib/db';
import { designPhases, Deliverable } from '../../data/design-phases';
import AddDeliverableModal from '../../components/AddDeliverableModal';
import DeliverableDrawer from '../../components/DeliverableDrawer';

const phases = designPhases.map(phase => ({
  id: phase.title,
  name: phase.title
}));

// Helper function to find deliverable details
const findDeliverableDetails = (deliverableId: string): Deliverable | null => {
  for (const phase of designPhases) {
    const deliverable = phase.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      return deliverable;
    }
  }
  return null;
};

// Helper function to get available deliverables for a phase
const getPhaseDeliverables = (phaseId: string): Deliverable[] => {
  const phase = designPhases.find(p => p.title === phaseId);
  return phase ? phase.deliverables : [];
};

interface ProjectWithDeliverables {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deliverables: Record<string, string[]>;
  deliverableIds: Record<string, string>; // Map of deliverable_id to project_deliverable_id
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectWithDeliverables | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const toast = useToast();
  const { 
    isOpen: isAddModalOpen, 
    onOpen: onAddModalOpen, 
    onClose: onAddModalClose 
  } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose
  } = useDisclosure();
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');
  const columnBg = useColorModeValue('gray.50', 'gray.800');

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProject(params.id);
        setProject(data);
      } catch (error) {
        toast({
          title: 'Error loading project',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProject();
    } else {
      setLoading(false);
    }
  }, [params.id, user, router, toast]);

  const handleAddDeliverable = (phaseId: string) => {
    setSelectedPhase(phaseId);
    onAddModalOpen();
  };

  const handleDeliverableClick = (deliverableId: string, phase: string) => {
    const deliverable = findDeliverableDetails(deliverableId);
    if (deliverable) {
      setSelectedDeliverable(deliverable);
      setSelectedPhase(phase);
      onDrawerOpen();
    }
  };

  const handleAddDeliverables = async (deliverableIds: string[]) => {
    try {
      await addProjectDeliverables(
        params.id,
        selectedPhase,
        deliverableIds,
        user!.id
      );

      // Update local state
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          deliverables: {
            ...prev.deliverables,
            [selectedPhase]: [
              ...(prev.deliverables[selectedPhase] || []),
              ...deliverableIds
            ]
          }
        };
      });

      toast({
        title: 'Deliverables added',
        description: 'The selected deliverables have been added to the project.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding deliverables',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    router.push('/auth');
    return null;
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Text color={textColor}>Loading project...</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8} align="stretch">
        {/* Project Header */}
        <Box pb={6} borderBottom="1px" borderColor={borderColor}>
          <Heading size="xl" fontWeight="medium" color={textColor} mb={3}>
            {project.title}
          </Heading>
          <Text color={descriptionColor} fontSize="md">
            {project.description}
          </Text>
        </Box>

        {/* Kanban Board */}
        <SimpleGrid columns={5} spacing={4} minH="600px">
          {phases.map((phase) => (
            <Box
              key={phase.id}
              bg={columnBg}
              p={4}
              borderRadius="md"
              border="1px"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
            >
              {/* Phase Header */}
              <Heading size="sm" fontWeight="medium" color={textColor} mb={4}>
                {phase.name}
              </Heading>

              {/* Deliverables */}
              <VStack spacing={3} align="stretch" flex="1" mb={4}>
                {project.deliverables[phase.id]?.map((deliverableId: string) => {
                  const deliverable = findDeliverableDetails(deliverableId);
                  if (!deliverable) return null;

                  return (
                    <Box
                      key={deliverableId}
                      p={4}
                      bg={cardBg}
                      borderRadius="md"
                      border="1px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={() => handleDeliverableClick(deliverableId, phase.id)}
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.500'),
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Text fontWeight="medium" color={textColor} mb={1}>
                        {deliverable.name}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color={descriptionColor}
                        noOfLines={2}
                      >
                        {deliverable.description}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>

              {/* Add Button */}
              <Button
                variant="ghost"
                size="sm"
                width="100%"
                onClick={() => handleAddDeliverable(phase.id)}
                color={descriptionColor}
                fontWeight="normal"
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700'),
                }}
              >
                Add Deliverable
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Add Deliverable Modal */}
      <AddDeliverableModal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        phase={selectedPhase}
        availableDeliverables={getPhaseDeliverables(selectedPhase)}
        existingDeliverableIds={project?.deliverables[selectedPhase] || []}
        onAdd={handleAddDeliverables}
      />

      {/* Deliverable Details Drawer */}
      <DeliverableDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        deliverable={selectedDeliverable}
        phase={selectedPhase}
        projectDeliverableId={project?.deliverableIds[selectedDeliverable?.id || ''] || ''}
      />
    </Container>
  );
} 