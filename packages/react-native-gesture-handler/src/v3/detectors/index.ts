export type { GestureDetectorProps } from './common';
export { GestureDetector } from './GestureDetector';
export { VirtualDetector as VirtualGestureDetector } from './VirtualDetector/VirtualDetector';
export { InterceptingGestureDetector } from './VirtualDetector/InterceptingGestureDetector';

export enum DetectorType {
  Native,
  Virtual,
  Intercepting,
}
