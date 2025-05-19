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
  Divider,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from '../lib/db';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email: string;
}

interface DeliverableCommentsProps {
  taskId: string;
}

export default function DeliverableComments({ taskId }: DeliverableCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      const data = await getTaskComments(taskId);
      setComments(data);
    } catch (error) {
      toast({
        title: 'Error loading comments',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePostComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      await createTaskComment(taskId, newComment, user.id);
      setNewComment('');
      await loadComments();
      toast({
        title: 'Comment posted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error posting comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;

    setLoading(true);
    try {
      await updateTaskComment(editingComment.id, editingComment.content);
      setEditingComment(null);
      await loadComments();
      toast({
        title: 'Comment updated',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setLoading(true);
    try {
      await deleteTaskComment(commentId);
      await loadComments();
      toast({
        title: 'Comment deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <Divider />
      
      {/* Comments list */}
      <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
        {comments.map((comment) => (
          <Box
            key={comment.id}
            p={3}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            bg={bgColor}
          >
            {editingComment?.id === comment.id ? (
              <Box>
                <Textarea
                  value={editingComment.content}
                  onChange={(e) =>
                    setEditingComment({
                      ...editingComment,
                      content: e.target.value,
                    })
                  }
                  size="sm"
                  resize="vertical"
                  mb={2}
                />
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleUpdateComment}
                    isLoading={loading}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingComment(null)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </Box>
            ) : (
              <>
                <HStack spacing={3} mb={2} justify="space-between">
                  <HStack spacing={3}>
                    <Avatar size="xs" name={comment.user_email} />
                    <VStack spacing={0} align="start">
                      <Text fontWeight="medium" fontSize="sm">
                        {comment.user_email}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </Text>
                    </VStack>
                  </HStack>
                  {user?.id === comment.user_id && (
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Comment options"
                        icon={<BiDotsVerticalRounded />}
                        variant="ghost"
                        size="xs"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<EditIcon />} 
                          onClick={() => setEditingComment(comment)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          icon={<DeleteIcon />} 
                          onClick={() => handleDeleteComment(comment.id)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
                <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap">
                  {comment.content}
                </Text>
              </>
            )}
          </Box>
        ))}
      </VStack>

      {/* Comment composer */}
      <Box>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          size="sm"
          resize="vertical"
          minH="80px"
          mb={2}
        />
        <Button
          colorScheme="blue"
          size="sm"
          isLoading={loading}
          onClick={handlePostComment}
          isDisabled={!newComment.trim()}
        >
          Post Comment
        </Button>
      </Box>
    </VStack>
  );
} 