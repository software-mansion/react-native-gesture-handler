import React from 'react';
import { forwardRef, LegacyRef } from 'react';
import { tagMessage } from '../../../utils';

let wrapID = 0;

export const Wrap = forwardRef(
  ({ children }: { children?: React.ReactNode }, ref) => {
    try {
      // I don't think that fighting with types over such a simple function is worth it
      // The only thing it does is add 'collapsable: false' to the child component
      // to make sure it is in the native view hierarchy so the detector can find
      // correct viewTag to attach to.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: any = React.Children.only(children);

      const clone = React.cloneElement(
        child,
        { collapsable: false },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        child.props.children
      );

      return (
        <div
          id={`RNGHWrapper${wrapID++}`}
          ref={ref as LegacyRef<HTMLDivElement>}
          style={{ display: 'contents' }}>
          {clone}
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
