import React, { useCallback, useMemo, useState } from 'react';
import { useAsync } from "react-async";
import { Api } from '../../../utils';
import { IconButton, Spinner, Switch, Tag, Tooltip } from '@chakra-ui/react'
import { Code } from '@chakra-ui/react'
import { ClickToCopyTooltip, DeleteFeatureDialog, Table } from '../../../components';
import { createColumnHelper } from '@tanstack/react-table';
import { chakra } from '@chakra-ui/react';
import { useArray } from '../../../hooks';
import { FiEdit3 } from 'react-icons/fi'
import { DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface FeatureEnvironmentSettings {
    isActive: boolean;
    environment: {
        id: string;
        name: string;
        key: string;
    }
}

interface Feature {
    id: string;
    name: string; 
    key: string;
    settings: Record<string, FeatureEnvironmentSettings>;
    isLoading?: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

function createFetchFeaturesFn(page: number) {
    return async function fetchFeatures({ projectId }, { signal }) {
        return Api.projects(projectId).features().list(page, DEFAULT_PAGE_SIZE, ['settings', 'settings.environment'], signal);
    }
}

async function updateFeature({ projectId, featureId, envId, isActive }) {
    return Api.projects(projectId).features(featureId).settings(envId).update({ isActive });
}

async function deleteFeature({ projectId, featureId }) {
    return Api.projects(projectId).features(featureId).delete();
}

export const AllFeaturesTable = ({ environmentKey, projectId }) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { value: data, update, concat } = useArray([]);

    const fetchFeaturesFn = useMemo(() => createFetchFeaturesFn(page), [page]);

    const featureState = useAsync({
        promiseFn: fetchFeaturesFn,
        projectId,
        onResolve: (props) => {
            // Auto-paginate
            if (props.pageSize === DEFAULT_PAGE_SIZE) {
                setTimeout(() => setPage(p => p + 1), 500);
            }
            concat(props.data);
        }
    });

    const onChangeStatus = useCallback((feature: Feature) => async () => {
        try {
            const itemIndex = data.findIndex(d => d.id === feature.id);
            const item = data[itemIndex];
            update(itemIndex, { ...item, isLoading: true });

            await updateFeature({ 
                projectId,
                featureId: feature.id,
                envId: feature.settings[environmentKey].environment.id,
                isActive: !feature.settings[environmentKey].isActive
            })

            // debounce
            setTimeout(() => {
                update(itemIndex, {
                    ...item,
                    isLoading: false,
                    settings: {
                        ...(item.settings ?? {}),
                        [environmentKey]: {
                            ...(item.settings?.[environmentKey] ?? {}),
                            isActive: !feature.settings[environmentKey].isActive
                        }
                    }
                })
            }, 300)
        } catch (err) {
            console.warn(err);
        }
    }, [projectId, environmentKey, data, update])

    const onDeleteFeature = (featureId: string) => async () => {
        //
    }

    const columnHelper = createColumnHelper<Feature>();
    const columnDefs = [
        columnHelper.accessor("name", {
            cell: (info) => info.getValue(),
            header: "Name"
        }),
        columnHelper.accessor("key", {
            cell: (info) => (
                <ClickToCopyTooltip value={info.getValue()}>
                    {({ onClick, ref }) => (
                        <Code
                            ref={ref} 
                            cursor="pointer" 
                            px="2" py="1" 
                            onClick={onClick(info.getValue())}
                        >
                            {info.getValue()}
                        </Code>
                    )}
                </ClickToCopyTooltip>
            ),
            header: "Key"
        }),
        {
            accessorFn: (row) => !!row.settings?.[environmentKey]?.isActive,
            cell: (info) => {
                const feature = info.row.original;
                const isFeatureActive = feature.settings?.[environmentKey] 
                    && feature.settings[environmentKey]?.isActive;

                if (feature.isLoading) return (<Spinner color="blue.500" />)
                return (
                    <Switch
                        onChange={onChangeStatus(feature)} 
                        isChecked={isFeatureActive} 
                    />
                )
            },
            header: "Enabled"
        },
        columnHelper.accessor("id", {
            cell: (info) => {
                return (
                    <>
                        <Tooltip label="Edit feature">
                            <IconButton 
                                aria-label='Edit Feature' 
                                onClick={() => navigate(`/projects/${projectId}/features/${info.row.original.key}`)}
                            >
                                <FiEdit3 />
                            </IconButton>
                        </Tooltip>
                        <DeleteFeatureDialog 
                            onConfirm={onDeleteFeature(info.getValue())} 
                            iconButton 
                        />
                    </>
                )
            },
            header: ""
        }),
    ]

    return (
        <chakra.div p="6" m="2" rounded="md" border="1px" borderColor="gray.300">
            <chakra.div mb="4">
                <Tag>
                    {data.length}{" / "}{featureState?.data?.totalItems}{" "}
                    Features loaded
                </Tag>
            </chakra.div>
            <Table<Feature> 
                columns={columnDefs}
                data={data ?? []} 
                totalItems={featureState.data?.totalItems}
            />
        </chakra.div>
    )
}