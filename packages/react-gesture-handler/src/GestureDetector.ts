import type { NativeDetectorProps } from '@swmansion/gesture-handler-core/src/v3/detectors/common';
import { NativeDetector as NativeDetectorImpl } from '@swmansion/gesture-handler-core/src/v3/detectors/NativeDetector';

import { runtime } from './runtime';

// On the DOM binding there is no legacy API, so GestureDetector IS the core
// NativeDetector (no instanceof switcher).
export function GestureDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(props: NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>) {
  return NativeDetectorImpl(runtime, props);
}
