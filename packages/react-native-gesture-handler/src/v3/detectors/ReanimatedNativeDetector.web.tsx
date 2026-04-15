import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import HostGestureDetector from './HostGestureDetector';

export const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);
