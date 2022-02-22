import { HostComponent, requireNativeComponent } from 'react-native';
import { RawButtonProps } from './GestureButtons';
import { ENABLE_FABRIC } from '../utils';

const RNGestureHandlerButtonNativeComponent = ENABLE_FABRIC
  ? require('../fabric/RNGestureHandlerButtonNativeComponent')
  : requireNativeComponent('RNGestureHandlerButton');

export default RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;
