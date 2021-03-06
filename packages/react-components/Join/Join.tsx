import * as React from 'react';

interface JoinProps {
  children: React.ReactNode;
  separator: React.ReactNode;
}

/**
 * Join React JSX children using a separator node.
 */
export default function Join({ children, separator }: JoinProps): React.ReactElement {
  return React.Children.map(children, (child, index) => (
    <>
      {index ? separator : null}
      {child}
    </>
  )) as any;
}
