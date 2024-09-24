import React from 'react';
import { Reanimated } from '../reanimatedWrapper';
import { tagMessage } from '../../../utils';
import { Platform } from 'react-native';

export class Wrap extends React.Component<{
  onGestureHandlerEvent?: unknown;
  // Implicit `children` prop has been removed in @types/react^18.0.0
  children?: React.ReactNode;
}> {
  render() {
    try {
      // I don't think that fighting with types over such a simple function is worth it
      // The only thing it does is add 'collapsable: false' to the child component
      // to make sure it is in the native view hierarchy so the detector can find
      // correct viewTag to attach to.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: any = React.Children.only(this.props.children);

      const clone = React.cloneElement(
        child,
        { collapsable: false },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        child.props.children
      );

      if (Platform.OS === 'web') {
        return <div style={{ display: 'contents' }}>{clone}</div>;
      }
      return clone;
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

export const MyWrap = React.forwardRef(
  (
    props: {
      onGestureHandlerEvent?: unknown;
      // Implicit `children` prop has been removed in @types/react^18.0.0
      children?: React.ReactNode;
    },
    ref
  ) => {
    const child: any = React.Children.only(props.children);

    const clone = React.cloneElement(
      child,
      { collapsable: false, ref: ref },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      child.props.children
    );

    return Platform.OS === 'web' ? (
      <div ref={ref} style={{ display: 'contents' }}>
        {clone}
      </div>
    ) : (
      clone
    );
  }
);
