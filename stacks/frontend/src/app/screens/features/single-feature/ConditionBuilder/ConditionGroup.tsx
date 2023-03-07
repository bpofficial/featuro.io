import React, { useCallback, useState } from 'react';
import { Button, Card, CardBody, Spacer, VStack } from "@chakra-ui/react";
import { SmallAddIcon } from '@chakra-ui/icons';
import { useConditionContext } from './ConditionContext';
import { ConditionLine } from './ConditionLine';
import { AndOrTag } from './AndOrTag';

interface Props {
    or?: boolean;
    and?: boolean;
    index: number;
}

export function ConditionGroup({ or = false, and = false, index }: Props) {
    const { update, state } = useConditionContext();
    const [andOrState, setAndOrState] = useState<'AND' | 'OR' | null>(or ? 'OR' : and ? 'AND' : null);

    const onAddCondition = useCallback(() => {
        const group = state[index];
        const conditions = group.conditions ?? [];
        conditions.push({});

        update(index, { conditions })
    }, [index, state, update])

    return (
        <>
            {or || and ? <Spacer /> : null}
            <Card borderWidth="1px" borderColor="gray.200" userSelect="none">
                <CardBody>
                    {andOrState ? (
                        <>
                            <AndOrTag 
                                value={andOrState} 
                                update={setAndOrState} 
                                tagProps={{
                                    mr: "4", position: "absolute", top: '-3'
                                }} 
                            />
                            <Spacer h="2" />
                        </>
                    )
                    : null}
                    <VStack spacing={4} h="full" align="flex-start"  userSelect="none">
                        {(state[index].conditions ?? []).map((_, i) => <ConditionLine key={i} index={i} groupIndex={index} and={i > 0} />)}
                        <Button variant="ghost" colorScheme="blue" alignContent="center" userSelect="none" onClick={onAddCondition}>
                            <SmallAddIcon mr="2" /> Add Inner Condition
                        </Button>
                    </VStack>
                </CardBody>
            </Card>
        </>
    )
}