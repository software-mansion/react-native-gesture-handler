import type { GestureDetectorProps as CoreGestureDetectorProps } from '@swmansion/gesture-handler-core/src/v3/detectors/common';

import type { GestureDetectorProps as LegacyDetectorProps } from '../../handlers/gestures/GestureDetector';

export type {
  InterceptingGestureDetectorProps,
  NativeDetectorProps,
  VirtualDetectorProps,
} from '@swmansion/gesture-handler-core/src/v3/detectors/common';
export { GestureDetectorType } from '@swmansion/gesture-handler-core/src/v3/detectors/common';

export type GestureDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> =
  | CoreGestureDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
  | LegacyDetectorProps;
