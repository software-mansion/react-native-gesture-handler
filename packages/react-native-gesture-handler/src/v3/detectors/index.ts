export type { GestureDetectorProps } from './common';
export { GestureDetector } from './GestureDetector';
export { InterceptingGestureDetector } from './VirtualDetector/InterceptingGestureDetector';
export { DisableInterceptingDetector } from './VirtualDetector/DisableInterceptingDetector';

export enum DetectorType {
  Native,
  Virtual,
  Intercepting,
}
