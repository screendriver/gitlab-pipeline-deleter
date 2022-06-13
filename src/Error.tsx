import React, { FunctionComponent, useEffect, PropsWithChildren } from 'react';
import { Text } from 'ink';

export interface ErrorProps {
    exit(): void;
}

export const Error: FunctionComponent<PropsWithChildren<ErrorProps>> = (props) => {
    useEffect(() => {
        props.exit();
    });

    return <Text color="red">{props.children}</Text>;
};
