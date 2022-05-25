/* eslint-disable @typescript-eslint/no-var-requires */
import { HostComponent, requireNativeComponent } from 'react-native';
import { RawButtonProps } from './GestureButtons';
import { shouldUseCodegenNativeComponent } from '../utils';

const RNGestureHandlerButtonNativeComponent = shouldUseCodegenNativeComponent()
  ? require('../fabric/RNGestureHandlerButtonNativeComponent').default
  : requireNativeComponent('RNGestureHandlerButton');

export default RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;
