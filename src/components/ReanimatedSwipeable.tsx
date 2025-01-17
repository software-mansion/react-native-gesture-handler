// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import React, { ForwardedRef, forwardRef } from 'react';
import type { PanGestureHandlerProps } from '../handlers/PanGestureHandler';
import { View } from 'react-native';

type SwipeableExcludes = Exclude<
  keyof PanGestureHandlerProps,
  'onGestureEvent' | 'onHandlerStateChange'
>;

export interface SwipeableProps
  extends Pick<PanGestureHandlerProps, SwipeableExcludes> {}

export interface SwipeableMethods {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
}

const Swipeable = forwardRef<SwipeableMethods, SwipeableProps>(
  function Swipeable(
    _props: SwipeableProps,
    _ref: ForwardedRef<SwipeableMethods>
  ) {
    return <View collapsable={false} />;
  }
);

export default Swipeable;
export type SwipeableRef = ForwardedRef<SwipeableMethods>;
