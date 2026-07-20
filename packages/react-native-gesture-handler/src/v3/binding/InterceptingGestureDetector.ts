import type { InterceptingGestureDetectorProps } from '@swmansion/gesture-handler-core/src/v3/detectors/common';
import { InterceptingGestureDetector as InterceptingGestureDetectorImpl } from '@swmansion/gesture-handler-core/src/v3/detectors/VirtualDetector/InterceptingGestureDetector';

import { runtime } from './runtime';

export function InterceptingGestureDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  props: InterceptingGestureDetectorProps<
    TConfig,
    THandlerData,
    TExtendedHandlerData
  >
) {
  return InterceptingGestureDetectorImpl(runtime, props);
}
