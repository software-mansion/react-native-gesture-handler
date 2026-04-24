import React from 'react';
import { Reanimated } from '../reanimatedWrapper';
import { tagMessage } from '../../../utils';

export class Wrap extends React.Component<{
  onGestureHandlerEvent?: unknown;
  // Implicit `children` prop has been removed in @types/react^18.0.0
  children?: React.ReactNode;
}> {
  override render() {
    try {
      // I don't think that fighting with types over such a simple function is worth it
      // The only thing it does is add 'collapsable: false' to the child component
      // to make sure it is in the native view hierarchy so the detector can find
      // correct viewTag to attach to.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: any = React.Children.only(this.props.children);
      return React.cloneElement(
        child,
        { collapsable: false },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        child.props.children
      );
    } catch (e) {
      throw new Error(
        tagMessage(
          `GestureDetector got more than one view as a child. If you want the gesture to work on multiple views, wrap them with a common parent and attach the gesture to that view.`
        )
      );
    }
  }
}

export const AnimatedWrap =
  Reanimated?.default?.createAnimatedComponent(Wrap) ?? Wrap;
