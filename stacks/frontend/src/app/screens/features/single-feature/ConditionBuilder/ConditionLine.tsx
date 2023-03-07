import React, { useState } from 'react';
import { Box, Flex, HStack, Input, Tag, Text } from '@chakra-ui/react';
import { DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';
import { Select } from '@chakra-ui/react'
import { useConditionContext } from './ConditionContext';
import { AndOrTag } from './AndOrTag';

interface Props {
    or?: boolean;
    and?: boolean;
    index: number;
    groupIndex?: number
}

export function ConditionLine({ or = false, and = false, index, groupIndex }: Props) {
    const { state, remove, update } = useConditionContext();
    const [andOrState, setAndOrState] = useState<'AND' | 'OR' | null>(or ? 'OR' : and ? 'AND' : null);

    const onDelete = () => {
        if (typeof groupIndex === 'number') {
            const group = state[groupIndex];
            if (!group?.conditions || group?.conditions?.length === 1) {
                remove(groupIndex);
            } else {
                update(groupIndex, {
                    conditions: (group?.conditions ?? [])
                        .filter((_, i) => i !== index)
                });
            }
        } else {
            remove(index);
        }
    }

    return (
        <Flex flex={1} align="center" direction="row" h="full"  userSelect="none">
            {andOrState ? (
                <AndOrTag
                    value={andOrState} 
                    update={setAndOrState} 
                    tagProps={{ mr: "4" }} 
                />
            ) : null}
            <Flex flex={1} h="full" bg="gray.50" border="1px" borderColor="gray.200" rounded="md">
                <Flex px="2" w="8" borderRight="1px" userSelect="none" borderColor="gray.200"
                      h="full" align="center" justify="center" cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                >
                    <DragHandleIcon color="gray.500" />
                </Flex>
                <HStack mx="4" spacing={4} py="2" userSelect="none">
                    <Text>If</Text>

                    <Select bg="white" placeholder="Target">
                        <option value='option1'>Host Header</option>
                        <option value='option2'>Organisation Id</option>
                        <option value='option3'>Hour of Day</option>
                        <option value='option3'>Date</option>
                    </Select>

                    <Text>from</Text>

                    <Select bg="white" placeholder="Source">
                        <option value='option2'>Context</option>
                        <option value='option1'>Headers</option>
                    </Select>

                    <Box width="sm">
                        <Select bg="white">
                            <option value='option2'>&#61;</option>
                            <option value='option1'>&ne;</option>
                            <option value='option1'>&gt;</option>
                            <option value='option1'>&ge;</option>
                            <option value='option1'>&lt;</option>
                            <option value='option1'>&le;</option>
                        </Select>
                    </Box>

                    <Input bg="white" placeholder='Custom value' />

                </HStack>
                <Flex px="2" w="8" borderLeft="1px" borderColor="gray.200" h="full" align="center" justify="center" cursor="pointer" 
                    _hover={{ color: "red.400" }}
                    color="gray.400"
                    userSelect="none"
                    onClick={onDelete}
                >
                    <DeleteIcon color="inherit" />
                </Flex>
            </Flex>
        </Flex>
    )
}