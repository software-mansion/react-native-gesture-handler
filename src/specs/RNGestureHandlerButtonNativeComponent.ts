import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps, ColorValue } from 'react-native';

interface NativeProps extends ViewProps {
  exclusive?: WithDefault<boolean, true>;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: WithDefault<boolean, true>;
  rippleColor?: ColorValue;
  rippleRadius?: Int32;
  touchSoundDisabled?: WithDefault<boolean, false>;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerButton');
