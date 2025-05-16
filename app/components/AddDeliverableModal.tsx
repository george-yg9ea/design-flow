import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Input,
  Box,
  Text,
  Checkbox,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { Deliverable } from '../data/design-phases';

interface AddDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: string;
  availableDeliverables: Deliverable[];
  existingDeliverableIds: string[];
  onAdd: (deliverableIds: string[]) => Promise<void>;
}

export default function AddDeliverableModal({
  isOpen,
  onClose,
  phase,
  availableDeliverables,
  existingDeliverableIds,
  onAdd,
}: AddDeliverableModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const itemBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  // Filter out already added deliverables and apply search
  const filteredDeliverables = availableDeliverables
    .filter(d => !existingDeliverableIds.includes(d.id))
    .filter(d => 
      searchQuery === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleToggleDeliverable = (deliverableId: string) => {
    setSelectedDeliverables(prev =>
      prev.includes(deliverableId)
        ? prev.filter(id => id !== deliverableId)
        : [...prev, deliverableId]
    );
  };

  const handleAdd = async () => {
    if (selectedDeliverables.length === 0) return;
    
    setLoading(true);
    try {
      await onAdd(selectedDeliverables);
      onClose();
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDeliverables([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>
          Add Deliverables to {phase} Phase
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={descriptionColor} />
              </InputLeftElement>
              <Input
                placeholder="Search deliverables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderColor={borderColor}
              />
            </InputGroup>

            <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
              {filteredDeliverables.length === 0 ? (
                <Text color={descriptionColor} textAlign="center" py={4}>
                  No deliverables available
                </Text>
              ) : (
                filteredDeliverables.map((deliverable) => (
                  <Box
                    key={deliverable.id}
                    p={4}
                    borderRadius="md"
                    border="1px"
                    borderColor={borderColor}
                    bg={itemBgColor}
                  >
                    <Checkbox
                      isChecked={selectedDeliverables.includes(deliverable.id)}
                      onChange={() => handleToggleDeliverable(deliverable.id)}
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
                ))
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor}>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            color={textColor}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleAdd}
            isLoading={loading}
            isDisabled={selectedDeliverables.length === 0}
            borderColor={borderColor}
            color={textColor}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          >
            Add Selected
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 