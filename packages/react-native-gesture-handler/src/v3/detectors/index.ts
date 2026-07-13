import type { GestureDetectorProps as CoreGestureDetectorProps } from '@swmansion/gesture-handler-core/src/v3/detectors/common';

import type { GestureDetectorProps as LegacyDetectorProps } from '../../handlers/gestures/GestureDetector';

// The core union covers the v3 detector shapes; the react-native package
// re-widens it with the legacy (v1/v2) detector props for backwards
// compatibility of the public GestureDetector component.
export type GestureDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> =
  | CoreGestureDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
  | LegacyDetectorProps;

export {
  InterceptingGestureDetector,
  VirtualGestureDetector,
} from '../binding';
export { GestureDetector } from './GestureDetector';
export { GestureDetectorType } from '@swmansion/gesture-handler-core/src/v3/detectors/common';
