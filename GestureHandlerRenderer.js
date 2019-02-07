import React from 'react';
import { Touchable } from 'react-native';

export default {
  render: ({
    children,
    ref,
    collapsable,
    onGestureHandlerEvent,
    onGestureHandlerStateChange,
    ...rest
  }) => {
    const child = React.Children.only(children);
    let grandChildren = child.props.children;
    if (
      Touchable.TOUCH_TARGET_DEBUG &&
      child.type &&
      (child.type === 'RNGestureHandlerButton' ||
        child.type.name === 'View' ||
        child.type.displayName === 'View')
    ) {
      grandChildren = React.Children.toArray(grandChildren);
      grandChildren.push(
        Touchable.renderDebugView({
          color: 'mediumspringgreen',
          hitSlop: child.props.hitSlop,
        })
      );
    }

    return React.cloneElement(
      child,
      {
        ref,
        collapsable,
        onGestureHandlerEvent,
        onGestureHandlerStateChange,
      },
      grandChildren
    );
  },
};
