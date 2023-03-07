import React from 'react';
import { Tag, TagProps } from "@chakra-ui/react";

interface Props {
    value: 'AND' | 'OR';
    update: (val: Props['value']) => void;
    tagProps?: TagProps;
}

export function AndOrTag({ value, update, tagProps = {} }: Props) {

    const handleUpdate = () => {
        // value === 'OR' ? update('AND') : update('OR');
    }

    return (
        <Tag colorScheme="blue" userSelect="none" onClick={handleUpdate} {...tagProps}>
            {value}
        </Tag>
    )
}