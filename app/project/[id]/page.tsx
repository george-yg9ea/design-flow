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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getProject, addProjectTasks, getProjectUpdates, createProjectUpdate, updateTaskStatus } from '../../lib/db';
import { designPhases, Deliverable } from '../../data/design-phases';
import AddDeliverableModal from '../../components/AddDeliverableModal';
import DeliverableDrawer from '../../components/DeliverableDrawer';
import ProjectUpdates from '../../components/ProjectUpdates';
import KanbanView from '../../components/KanbanView';
import MoodGraph from '../../components/MoodGraph';

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

interface ProjectWithTasks {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  tasks: Record<string, string[]>;
  taskIds: Record<string, string>;
  tasksByStatus: Record<string, Array<{
    id: string;
    taskId: string;
    phase: string;
    status: 'todo' | 'in_progress' | 'done';
  }>>;
}

interface Update {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
  user_name: string;
  user_id: string;
  mood: 'not_great' | 'okay' | 'good' | 'great';
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectWithTasks | null>(null);
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
  const tabBg = useColorModeValue('gray.50', 'gray.700');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isKanbanView, setIsKanbanView] = useState(false);

  const loadProject = async () => {
    try {
      const [projectData, updatesData] = await Promise.all([
        getProject(params.id),
        getProjectUpdates(params.id)
      ]);
      setProject(projectData);
      setUpdates(updatesData);
    } catch (error) {
      toast({
        title: 'Error loading project',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle auth redirect
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Load project data
  useEffect(() => {
    if (user) {
      loadProject();
    }
  }, [params.id, user]);

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
      await addProjectTasks(
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
          tasks: {
            ...prev.tasks,
            [selectedPhase]: [
              ...(prev.tasks[selectedPhase] || []),
              ...deliverableIds
            ]
          }
        };
      });

      toast({
        title: 'Tasks added',
        description: 'The selected tasks have been added to the project.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding tasks',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePostUpdate = async (content: string, mood: 'not_great' | 'okay' | 'good' | 'great') => {
    if (!user || !content.trim()) return;
    
    try {
      await createProjectUpdate(params.id, content, user.id, mood);
      await loadProject();
    } catch (error) {
      toast({
        title: 'Error posting update',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus as 'todo' | 'in_progress' | 'done');
      // Refresh project data
      loadProject();
    } catch (error) {
      toast({
        title: 'Error updating task status',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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

  if (!user) {
    return null;
  }

  if (!project) {
    return (
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Text color={textColor}>Project not found</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container 
      maxW="container.xl" 
      h="calc(100vh - 72px)" 
      p={4} 
      display="flex" 
      flexDirection="column" 
      overflow="hidden"
    >
      {/* Project Header */}
      <Box pb={4} borderBottom="1px" borderColor={borderColor} flexShrink={0}>
        <Heading size="xl" fontWeight="medium" color={textColor} mb={3}>
          {project.title}
        </Heading>
        <Text color={descriptionColor} fontSize="md">
          {project.description}
        </Text>
      </Box>

      {/* Tabs */}
      <Tabs display="flex" flexDirection="column" flex="1" overflow="hidden" mt={4}>
        <TabList flexShrink={0}>
          <Tab>Dashboard</Tab>
          <Tab>Board</Tab>
          <Tab>Updates</Tab>
        </TabList>

        <TabPanels flex="1" overflow="hidden">
          {/* Dashboard Tab */}
          <TabPanel h="full" p={0} pt={4} display="flex" flexDirection="column" overflow="hidden">
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={4} color={textColor}>
                  How's Everyone Feeling?
                </Heading>
                <Box 
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <MoodGraph updates={updates} />
                </Box>
              </Box>
              
              {/* Add more dashboard widgets here */}
            </VStack>
          </TabPanel>

          {/* Board Tab */}
          <TabPanel h="full" p={0} pt={4} display="flex" flexDirection="column" overflow="hidden">
            {/* View Toggle */}
            <HStack justify="flex-end" mb={4}>
              <FormControl display="flex" alignItems="center" maxW="300px">
                <FormLabel htmlFor="view-toggle" mb={0}>
                  Design Phases View
                </FormLabel>
                <Switch
                  id="view-toggle"
                  isChecked={isKanbanView}
                  onChange={(e) => setIsKanbanView(e.target.checked)}
                />
                <Text ml={2}>Kanban View</Text>
              </FormControl>
            </HStack>

            {isKanbanView ? (
              <Box flex="1" overflow="hidden">
                <KanbanView
                  tasks={Object.entries(project?.tasksByStatus || {}).flatMap(([status, tasks]) =>
                    tasks.map(task => ({
                      ...task,
                      name: findDeliverableDetails(task.id)?.name || 'Unknown Task',
                      status: task.status as 'todo' | 'in_progress' | 'done'
                    }))
                  )}
                  onTaskClick={handleDeliverableClick}
                  onStatusChange={handleStatusChange}
                  onAddTask={(status) => {
                    setSelectedPhase('');  // Reset phase since this is status-based
                    onAddModalOpen();
                  }}
                />
              </Box>
            ) : (
              <Box flex="1" overflowX="auto" overflowY="hidden">
                <HStack spacing={6} minW="fit-content" h="full">
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
                      minW="280px"
                      maxW="280px"
                      h="full"
                    >
                      {/* Phase Header */}
                      <HStack justify="space-between" mb={4} align="center">
                        <Heading size="sm" fontWeight="medium" color={textColor}>
                          {phase.name}
                        </Heading>
                        <IconButton
                          aria-label="Add task"
                          icon={<AddIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddDeliverable(phase.id)}
                          color={descriptionColor}
                          _hover={{
                            bg: useColorModeValue('gray.50', 'gray.700'),
                          }}
                        />
                      </HStack>

                      {/* Deliverables */}
                      <VStack 
                        spacing={3} 
                        align="stretch" 
                        flex="1" 
                        overflowY="auto"
                        overflowX="hidden"
                        mb={4}
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            width: '6px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: borderColor,
                            borderRadius: '24px',
                          },
                        }}
                      >
                        <Box minH={0} flex="1">
                          {project.tasks[phase.id]?.map((deliverableId: string) => {
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
                                mb={3}
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
                        </Box>
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
                        Add Task
                      </Button>
                    </Box>
                  ))}
                </HStack>
              </Box>
            )}
          </TabPanel>

          {/* Updates Tab */}
          <TabPanel p={0} pt={4} h="full" display="flex" flexDirection="column">
            <Box flex="1" overflowY="auto">
              <ProjectUpdates
                projectId={params.id}
                updates={updates}
                onPostUpdate={handlePostUpdate}
                onRefreshUpdates={loadProject}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Add Deliverable Modal */}
      <AddDeliverableModal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        phase={selectedPhase}
        availableDeliverables={getPhaseDeliverables(selectedPhase)}
        existingDeliverableIds={project?.tasks[selectedPhase] || []}
        onAdd={handleAddDeliverables}
      />

      {/* Deliverable Details Drawer */}
      <DeliverableDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        deliverable={selectedDeliverable}
        phase={selectedPhase}
        taskId={project?.taskIds[selectedDeliverable?.id || ''] || ''}
      />
    </Container>
  );
} 