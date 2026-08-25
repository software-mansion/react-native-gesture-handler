import type { VirtualDetectorProps } from '@swmansion/gesture-handler-core/src/v3/detectors/common';
import { VirtualDetector as VirtualDetectorImpl } from '@swmansion/gesture-handler-core/src/v3/detectors/VirtualDetector/VirtualDetector';

import { runtime } from './runtime';

export function VirtualDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(props: VirtualDetectorProps<TConfig, THandlerData, TExtendedHandlerData>) {
  return VirtualDetectorImpl(runtime, props);
}
