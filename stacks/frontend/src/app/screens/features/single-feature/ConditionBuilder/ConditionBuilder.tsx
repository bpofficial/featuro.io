import React from 'react';
import { Button, Card, CardBody, CardFooter, Flex, VStack } from '@chakra-ui/react';
import { ConditionLine } from './ConditionLine';
import { ConditionGroup } from './ConditionGroup';
import { ConditionContextConsumer, ConditionContextProvider } from './ConditionContext';
import { PlusSquareIcon, SmallAddIcon } from '@chakra-ui/icons';

export function ConditionBuilder() {
    return (
        <ConditionContextProvider>
            <Card w="full">
                <CardBody>
                    <ConditionStack />
                </CardBody>
                <CardFooter pt="0">
                    <ConditionActions />
                </CardFooter>
            </Card>
        </ConditionContextProvider>
    )
}

function ConditionStack() {
    return (
        <Flex direction="row" h="full">
            <VStack h="full" spacing={4}>
                <ConditionContextConsumer>
                    {({ state }) => state.map((c, i) => {
                        if (c.conditions) return <ConditionGroup key={i} index={i} or={i > 0} />
                        return <ConditionLine key={i} index={i} or={i > 0} />;
                    })}
                </ConditionContextConsumer>
            </VStack>
        </Flex>
    )
}

function ConditionActions() {
    return <ConditionContextConsumer>
        {({ push }) => (
            <Flex direction="row" justify="space-between" flex={1} borderTop="1px" borderColor="gray.100" pt="1.25rem">
                <Flex>
                    <Button colorScheme="blue" alignContent="center" variant="ghost" onClick={() => push({})}>
                        <SmallAddIcon /> Add Condition
                    </Button>
                    <Button colorScheme="blue" alignContent="center" variant="ghost" onClick={() => push({ conditions: [{}] })}>
                        <PlusSquareIcon mr="1" /> Add Group
                    </Button>
                </Flex>
                <Flex>
                    <Button colorScheme="blue">Save</Button>
                </Flex>
            </Flex>
        )}
    </ConditionContextConsumer>
}