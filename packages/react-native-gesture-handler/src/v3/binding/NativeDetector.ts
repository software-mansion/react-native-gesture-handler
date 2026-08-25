import type { NativeDetectorProps } from '@swmansion/gesture-handler-core/src/v3/detectors/common';
import { NativeDetector as NativeDetectorImpl } from '@swmansion/gesture-handler-core/src/v3/detectors/NativeDetector';

import { runtime } from './runtime';

export function NativeDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(props: NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>) {
  return NativeDetectorImpl(runtime, props);
}
