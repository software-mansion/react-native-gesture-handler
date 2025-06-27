import React from 'react';
import type { PropsWithChildren } from 'react';
import { tagMessage } from '../../../utils';
import { isRNSVGNode } from '../../../web/utils';

type WrapProps = PropsWithChildren & { ref: (ref: Element) => void };

export const Wrap = ({ children, ref }: WrapProps) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child: any = React.Children.only(children);

    if (isRNSVGNode(child)) {
      const clone = React.cloneElement(
        child,
        { ref },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        child.props.children
      );

      return clone;
    }

    return (
      // @ts-ignore ref is handled correctly by the GestureDetector
      <div ref={ref} style={{ display: 'contents' }}>
        {child}
      </div>
    );
  } catch (e) {
    throw new Error(
      tagMessage(
        `GestureDetector got more than one view as a child. If you want the gesture to work on multiple views, wrap them with a common parent and attach the gesture to that view.`
      )
    );
  }
};
