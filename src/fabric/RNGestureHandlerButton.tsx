import { HostComponent } from 'react-native';
import { RawButtonProps } from '../components/GestureButtons';

// @ts-ignore react-native-codegen does not support TypeScript yet
import RNGestureHandlerButtonNativeComponent from '../fabric/RNGestureHandlerButtonNativeComponent';

export default RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;
