import React, { forwardRef } from 'react';
import type { LegacyRef, PropsWithChildren } from 'react';
import { tagMessage } from '../../../utils';
import { isRNSVGNode } from '../../../web/utils';

export const Wrap = forwardRef<HTMLDivElement, PropsWithChildren<{}>>(
  ({ children }, ref) => {
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
        <div
          ref={ref as LegacyRef<HTMLDivElement>}
          style={{ display: 'contents' }}>
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
  }
);

// On web we never take a path with Reanimated,
// therefore we can simply export Wrap
export const AnimatedWrap = Wrap;
