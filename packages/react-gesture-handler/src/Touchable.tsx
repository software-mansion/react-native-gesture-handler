import type { TouchableBehaviorProps } from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';
import type * as React from 'react';

import { Touchable as BoundTouchable } from './binding';

export type TouchableProps = TouchableBehaviorProps &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onPointerDown' | 'onPointerUp'
  > & {
    ref?: React.Ref<HTMLDivElement>;
  };

// The Touchable component itself lives in core (v3/press/Touchable) and is
// bound by createGestureHandlerAPI; the DOM pieces reach it through the
// port's press kit (the div-based GestureHandlerButton). This module only
// narrows the loose core prop type to DOM attributes.
export const Touchable = BoundTouchable as unknown as (
  props: TouchableProps
) => React.JSX.Element;
