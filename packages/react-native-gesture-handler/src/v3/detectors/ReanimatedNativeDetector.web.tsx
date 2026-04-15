import HostGestureDetector from './HostGestureDetector';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

export const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);
