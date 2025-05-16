'use client';

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  UnorderedList,
  ListItem,
  Link,
  VStack,
  useColorModeValue,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ProjectDeliverableDocument, 
  getProjectDeliverableDocuments,
  addProjectDeliverableDocument,
  updateProjectDeliverableDocument,
  deleteProjectDeliverableDocument
} from '../lib/db';

interface Document extends ProjectDeliverableDocument {}

interface DeliverableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: {
    id: string;
    name: string;
    description: string;
    preparation: {
      steps: string[];
      resources?: { title: string; url: string; }[];
    };
  } | null;
  phase: string;
  projectDeliverableId: string;
}

function DocumentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (doc: { title: string; url: string }) => void;
  initialData?: { title: string; url: string } | null;
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [urlError, setUrlError] = useState('');

  // Reset form when modal is opened/closed or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setUrl(initialData?.url || '');
      setUrlError('');
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setUrlError('');
    onClose();
  };

  const validateAndFormatUrl = (url: string): string => {
    // If URL already has a protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Add https:// as default protocol
    return `https://${url}`;
  };

  const handleSave = () => {
    try {
      const formattedUrl = validateAndFormatUrl(url);
      // Test if URL is valid
      new URL(formattedUrl);
      setUrlError('');
      onSave({ title, url: formattedUrl });
      handleClose();
    } catch (error) {
      setUrlError('Please enter a valid URL');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setUrlError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialData ? 'Edit Document' : 'Add Document'}</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </FormControl>
            <FormControl isInvalid={!!urlError}>
              <FormLabel>Link</FormLabel>
              <Input 
                value={url} 
                onChange={handleUrlChange}
                placeholder="Enter document URL (e.g., example.com or https://example.com)"
              />
              {urlError && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {urlError}
                </Text>
              )}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave}
            isDisabled={!title || !url}
          >
            {initialData ? 'Save Changes' : 'Add Document'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function DeliverableDrawer({
  isOpen,
  onClose,
  deliverable,
  phase,
  projectDeliverableId,
}: DeliverableDrawerProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accordionBg = useColorModeValue('gray.50', 'gray.700');
  const linkColor = useColorModeValue('blue.600', 'blue.200');
  const toast = useToast();
  const { user } = useAuth();

  // Document management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const { 
    isOpen: isDocModalOpen, 
    onOpen: onDocModalOpen, 
    onClose: onDocModalClose 
  } = useDisclosure();

  useEffect(() => {
    async function loadDocuments() {
      if (!projectDeliverableId) return;
      
      try {
        const docs = await getProjectDeliverableDocuments(projectDeliverableId);
        setDocuments(docs);
      } catch (error) {
        toast({
          title: 'Error loading documents',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }

    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, projectDeliverableId, toast]);

  const handleAddDocument = async (doc: { title: string; url: string }) => {
    if (!user) return;

    setLoading(true);
    try {
      const newDoc = await addProjectDeliverableDocument(
        projectDeliverableId,
        doc.title,
        doc.url,
        user.id
      );
      setDocuments([...documents, newDoc]);
      toast({
        title: 'Document added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error adding document',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = async (doc: { title: string; url: string }) => {
    if (!editingDoc) return;

    setLoading(true);
    try {
      const updatedDoc = await updateProjectDeliverableDocument(
        editingDoc.id,
        doc.title,
        doc.url
      );
      setDocuments(documents.map(d => 
        d.id === editingDoc.id ? updatedDoc : d
      ));
      setEditingDoc(null);
      toast({
        title: 'Document updated',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating document',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setLoading(true);
    try {
      await deleteProjectDeliverableDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
      toast({
        title: 'Document deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting document',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditDocument = (doc: Document) => {
    setEditingDoc(doc);
    onDocModalOpen();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {deliverable?.name}
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={6} align="stretch">
            <Text whiteSpace="pre-wrap">
              {deliverable?.description}
            </Text>

            <Accordion allowToggle>
              <AccordionItem border="1px" borderColor={borderColor} borderRadius="md">
                <AccordionButton 
                  py={3}
                  _hover={{ bg: accordionBg }}
                  _expanded={{ bg: accordionBg }}
                >
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    How to prepare {deliverable?.name}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="medium" mb={2}>Steps:</Text>
                      <UnorderedList spacing={2}>
                        {deliverable?.preparation.steps.map((step, index) => (
                          <ListItem key={index}>{step}</ListItem>
                        ))}
                      </UnorderedList>
                    </Box>

                    {deliverable?.preparation.resources && (
                      <Box>
                        <Text fontWeight="medium" mb={2}>Useful Resources:</Text>
                        <UnorderedList spacing={2}>
                          {deliverable.preparation.resources.map((resource, index) => (
                            <ListItem key={index}>
                              <Link
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                color={linkColor}
                                _hover={{ textDecoration: 'underline' }}
                              >
                                {resource.title}
                              </Link>
                            </ListItem>
                          ))}
                        </UnorderedList>
                      </Box>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <Divider />

            <Box>
              <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Text fontWeight="medium" fontSize="lg">Documents</Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  onClick={() => {
                    setEditingDoc(null);
                    onDocModalOpen();
                  }}
                  isLoading={loading}
                >
                  Add Document
                </Button>
              </Box>

              <VStack spacing={2} align="stretch">
                {documents.map((doc, index) => (
                  <Box key={doc.id}>
                    {index > 0 && <Divider my={2} />}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Link
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color={linkColor}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {doc.title}
                      </Link>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<BsThreeDotsVertical />}
                          variant="ghost"
                          size="sm"
                          aria-label="Document options"
                          isDisabled={loading}
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<EditIcon />}
                            onClick={() => startEditDocument(doc)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem 
                            icon={<DeleteIcon />}
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>

      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={onDocModalClose}
        onSave={editingDoc ? handleEditDocument : handleAddDocument}
        initialData={editingDoc}
      />
    </Drawer>
  );
} 