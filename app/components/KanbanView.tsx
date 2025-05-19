import {
  Box,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Heading,
  Button,
  SimpleGrid,
  IconButton,
} from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Deliverable } from '../data/design-phases';
import { AddIcon } from '@chakra-ui/icons';

interface KanbanTask {
  id: string;
  taskId: string;
  name: string;
  phase: string;
  status: 'todo' | 'in_progress' | 'done';
}

interface Column {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanViewProps {
  tasks: KanbanTask[];
  onTaskClick: (taskId: string, phase: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onAddTask: (status: string) => void;
}

export default function KanbanView({ tasks, onTaskClick, onStatusChange, onAddTask }: KanbanViewProps) {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', title: 'In Progress', tasks: tasks.filter(t => t.status === 'in_progress') },
    { id: 'done', title: 'Done', tasks: tasks.filter(t => t.status === 'done') },
  ]);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const columnBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task that was dragged
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Update the task's status in the database
    try {
      await onStatusChange(task.taskId, destination.droppableId);

      // Update local state
      const newColumns = columns.map(col => ({
        ...col,
        tasks: col.id === destination.droppableId
          ? [...col.tasks, { ...task, status: destination.droppableId as any }]
          : col.tasks.filter(t => t.id !== task.id)
      }));

      setColumns(newColumns);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} h="full">
        {columns.map(column => (
          <Box
            key={column.id}
            bg={columnBg}
            p={4}
            borderRadius="md"
            border="1px"
            borderColor={borderColor}
            display="flex"
            flexDirection="column"
            h="full"
            minH={0}
          >
            {/* Column Header */}
            <HStack justify="space-between" mb={4} align="center">
              <Heading size="sm" fontWeight="medium" color={textColor}>
                {column.title} ({column.tasks.length})
              </Heading>
              <IconButton
                aria-label="Add task"
                icon={<AddIcon />}
                size="sm"
                variant="ghost"
                onClick={() => onAddTask(column.id)}
                color={descriptionColor}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                }}
              />
            </HStack>

            {/* Tasks */}
            <Droppable droppableId={column.id}>
              {(provided) => (
                <VStack
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  spacing={3}
                  align="stretch"
                  flex="1"
                  minH={0}
                  overflowY="auto"
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
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          p={4}
                          bg={cardBg}
                          borderRadius="md"
                          border="1px"
                          borderColor={borderColor}
                          cursor="pointer"
                          onClick={() => onTaskClick(task.id, task.phase)}
                          _hover={{
                            borderColor: useColorModeValue('gray.300', 'gray.500'),
                            transform: 'translateY(-1px)',
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Text fontWeight="medium" color={textColor} mb={1}>
                            {task.name}
                          </Text>
                          <Text 
                            fontSize="sm" 
                            color={descriptionColor}
                          >
                            {task.phase}
                          </Text>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </VStack>
              )}
            </Droppable>

            {/* Add Task Button */}
            <Button
              variant="ghost"
              size="sm"
              width="100%"
              onClick={() => onAddTask(column.id)}
              color={descriptionColor}
              fontWeight="normal"
              _hover={{
                bg: useColorModeValue('gray.100', 'gray.700'),
              }}
            >
              Add Task
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </DragDropContext>
  );
} 