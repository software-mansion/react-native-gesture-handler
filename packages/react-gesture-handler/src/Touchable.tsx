import { Touchable as TouchableImpl } from '@swmansion/gesture-handler-core/src/v3/press/Touchable';
import type {
  CoreTouchableProps,
  TouchableBehaviorProps,
  TouchablePressKit,
} from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import NativeViewGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/NativeViewGestureHandler';
import type * as React from 'react';

import { ButtonComponent as GestureHandlerButton } from './GestureHandlerButton';
import { runtime } from './runtime';

// Touchable's press gesture is a NativeViewGestureHandler under the hood.
registerHandlerClass(SingleGestureName.Native, NativeViewGestureHandler);

// The press kit lives HERE, next to the component, rather than on the
// platform port — so the DOM host button is only bundled when Touchable is
// imported.
const press: TouchablePressKit = {
  Button: GestureHandlerButton,
  // hitSlop/testID configure the gesture, not the DOM element — drop them
  // before they reach the div as unknown attributes.
  mapButtonProps: (rest: Record<string, unknown>) => {
    const hostProps = { ...rest };
    delete hostProps.hitSlop;
    delete hostProps.testID;
    return hostProps;
  },
};

export type TouchableProps = TouchableBehaviorProps &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onPointerDown' | 'onPointerUp'
  > & {
    ref?: React.Ref<HTMLDivElement>;
  };

// The Touchable component itself lives in core (v3/press/Touchable); this
// module supplies the DOM pieces and narrows the loose core prop type to
// DOM attributes.
export function Touchable(props: TouchableProps) {
  return TouchableImpl(runtime, press, props as unknown as CoreTouchableProps);
}
