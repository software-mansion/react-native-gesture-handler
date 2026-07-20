import { createNativeWrapperFactory } from '@swmansion/gesture-handler-core/src/v3/createNativeWrapper';

import { InterceptingGestureDetector } from './InterceptingGestureDetector';
import { NativeDetector } from './NativeDetector';
import { useNativeGesture } from './useNativeGesture';
import { VirtualDetector } from './VirtualDetector';

export const createNativeWrapper = createNativeWrapperFactory({
  NativeDetector,
  VirtualDetector,
  InterceptingGestureDetector,
  useNativeGesture,
});
