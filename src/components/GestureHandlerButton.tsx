/* eslint-disable @typescript-eslint/no-var-requires */
import { HostComponent, requireNativeComponent } from 'react-native';
import { RawButtonProps } from './GestureButtons';
import { ENABLE_FABRIC } from '../utils';

const RNGestureHandlerButtonNativeComponent = ENABLE_FABRIC
  ? require('../fabric/RNGestureHandlerButtonNativeComponent').default
  : requireNativeComponent('RNGestureHandlerButton');

export default RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;
