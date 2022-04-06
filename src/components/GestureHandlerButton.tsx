/* eslint-disable @typescript-eslint/no-var-requires */
import { HostComponent, requireNativeComponent } from 'react-native';
import { RawButtonProps } from './GestureButtons';
import { shouldUseCodegen } from '../utils';

const RNGestureHandlerButtonNativeComponent = shouldUseCodegen()
  ? require('../fabric/RNGestureHandlerButtonNativeComponent').default
  : requireNativeComponent('RNGestureHandlerButton');

export default RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;
