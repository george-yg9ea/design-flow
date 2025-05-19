import {
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  useColorModeValue,
  Avatar,
  HStack,
  IconButton,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ButtonGroup,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProjectUpdate, deleteProjectUpdate } from '../lib/db';
import MoodGraph from './MoodGraph';

interface Update {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
  user_name: string;
  user_id: string;
  mood: 'not_great' | 'okay' | 'good' | 'great';
}

const moodEmojis = {
  not_great: '😕',
  okay: '🙂',
  good: '😄',
  great: '🤗'
};

const moodLabels = {
  not_great: 'Not Great',
  okay: 'Okay',
  good: 'Good',
  great: 'Great'
};

const moodStatements = {
  not_great: 'is not feeling great 😕',
  okay: 'is feeling okay 🙂',
  good: 'is feeling good 😄',
  great: 'is feeling great 🤗'
};

interface ProjectUpdatesProps {
  projectId: string;
  updates: Update[];
  onPostUpdate: (content: string, mood: Update['mood']) => Promise<void>;
  onRefreshUpdates: () => Promise<void>;
}

export default function ProjectUpdates({ 
  projectId, 
  updates, 
  onPostUpdate,
  onRefreshUpdates 
}: ProjectUpdatesProps) {
  const [newUpdate, setNewUpdate] = useState('');
  const [selectedMood, setSelectedMood] = useState<Update['mood'] | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');

  const handlePost = async () => {
    if (!newUpdate.trim() || !selectedMood) return;
    
    setIsPosting(true);
    try {
      await onPostUpdate(newUpdate.trim(), selectedMood);
      setNewUpdate('');
      setSelectedMood(null);
      toast({
        title: 'Update posted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error posting update',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleEdit = (update: Update) => {
    setEditingUpdate(update);
    setEditContent(update.content);
    onOpen();
  };

  const handleDelete = async (updateId: string) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;

    setIsDeleting(true);
    try {
      await deleteProjectUpdate(updateId);
      await onRefreshUpdates();
      toast({
        title: 'Update deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting update',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUpdate || !editContent.trim()) return;

    setIsEditing(true);
    try {
      await updateProjectUpdate(editingUpdate.id, editContent.trim());
      await onRefreshUpdates();
      onClose();
      toast({
        title: 'Update edited',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error editing update',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="100%" maxW="800px" mx="auto">
      {/* Update composer */}
      <Box
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
      >
        <Textarea
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          placeholder="Share an update about this project..."
          resize="vertical"
          minH="100px"
          mb={4}
        />
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color={textColor} mb={1}>How do you feel?</Text>
            <ButtonGroup size="md" spacing={2}>
              {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "solid" : "ghost"}
                  onClick={() => setSelectedMood(mood)}
                  colorScheme={selectedMood === mood ? "blue" : "gray"}
                  leftIcon={<Text fontSize="lg">{moodEmojis[mood]}</Text>}
                >
                  {moodLabels[mood]}
                </Button>
              ))}
            </ButtonGroup>
          </VStack>
          <Button
            colorScheme="blue"
            isLoading={isPosting}
            onClick={handlePost}
            isDisabled={!newUpdate.trim() || !selectedMood}
          >
            Post Update
          </Button>
        </HStack>
      </Box>

      {/* Updates List */}
      <VStack spacing={4} align="stretch" pb={6}>
        {updates.map((update) => (
          <Box
            key={update.id}
            p={4}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            bg={bgColor}
          >
            <HStack spacing={3} mb={3} justify="space-between">
              <HStack spacing={3}>
                <Avatar size="sm" name={update.user_email} />
                <VStack spacing={0} align="start">
                  <HStack spacing={2}>
                    <HStack spacing={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {update.user_name}
                      </Text>
                      <Text fontSize="sm">
                        {moodStatements[update.mood || 'good']}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(update.created_at).toLocaleString()}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              {user?.id === update.user_id && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<BiDotsVerticalRounded />}
                    variant="ghost"
                    size="sm"
                    aria-label="More options"
                  />
                  <MenuList>
                    <MenuItem 
                      icon={<EditIcon />}
                      onClick={() => handleEdit(update)}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem 
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(update.id)}
                      isDisabled={isDeleting}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </HStack>
            <Text color={textColor}>{update.content}</Text>
          </Box>
        ))}
      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Update</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              resize="vertical"
              minH="150px"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveEdit}
              isLoading={isEditing}
              isDisabled={!editContent.trim()}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
} 