import React from 'react';
import { useAsync } from 'react-async';
import { useParams } from "react-router-dom";
import { Api } from '../../../utils';
import { chakra, Flex, Heading, Spacer } from '@chakra-ui/react';
import { ConditionBuilder } from './ConditionBuilder/ConditionBuilder';

async function retrieveFeature({ projectId, featureKey }, { signal }) {
    return Api.projects(projectId).features(featureKey).retrieve(['settings', 'conditionSets.conditions.target'], signal);
}

export function SingleFeature() {
    const { projectId, featureKey } = useParams();
    const featureState = useAsync({ promiseFn: retrieveFeature, projectId, featureKey });

    const feature = featureState.data ?? {};

    return (
        <chakra.div m="2">
            <Heading>{feature.name}</Heading>
            <Spacer h="12" />
            <Flex flex={1} w="4xl">
                <ConditionBuilder />
            </Flex>
        </chakra.div>
    )
}