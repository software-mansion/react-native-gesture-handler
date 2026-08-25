import { tagMessage } from '@swmansion/gesture-handler-core/src/utils';
import { isRNSVGNode } from '@swmansion/gesture-handler-dom-engine/src/utils';
import type { LegacyRef, PropsWithChildren } from 'react';
import React from 'react';

export const Wrap = ({
  ref,
  children,
}: PropsWithChildren<NonNullable<unknown>> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child: any = React.Children.only(children);

    if (isRNSVGNode(child)) {
      const clone = React.cloneElement(
        child,
        { ref: ref ?? null },
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
};
