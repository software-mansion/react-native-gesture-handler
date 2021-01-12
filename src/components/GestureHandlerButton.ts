import { HostComponent, requireNativeComponent } from 'react-native';
import { RawButtonProperties } from './GestureButtons';
const RNGestureHandlerButton: HostComponent<RawButtonProperties> = requireNativeComponent(
  'RNGestureHandlerButton'
);

export default RNGestureHandlerButton;
