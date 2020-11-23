import { FunctionComponent, useEffect } from 'react';
import { Text } from 'ink';

export interface ErrorProps {
  exit: () => void;
}

export const Error: FunctionComponent<ErrorProps> = (props) => {
  useEffect(() => {
    props.exit();
  });
  return <Text color="red">{props.children}</Text>;
};
