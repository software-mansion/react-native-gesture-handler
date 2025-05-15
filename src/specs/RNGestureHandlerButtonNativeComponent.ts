import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Int32,
  WithDefault,
  Float,
  UnsafeMixed,
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

  // explicitly redefine `borderFooRadius`, as `ViewProps` defines it as `Float`,
  // but as of RN 0.75.0 it should be defined as `Dynamic` (`Double | string` or `UnsafeMixed`).
  borderRadius?: UnsafeMixed;
  borderTopLeftRadius?: UnsafeMixed;
  borderTopRightRadius?: UnsafeMixed;
  borderBottomLeftRadius?: UnsafeMixed;
  borderBottomRightRadius?: UnsafeMixed;

  borderWidth?: Float;
  borderLeftWidth?: Float;
  borderRightWidth?: Float;
  borderTopWidth?: Float;
  borderBottomWidth?: Float;
  borderStartWidth?: Float;
  borderEndWidth?: Float;

  borderColor?: ColorValue;
  borderLeftColor?: ColorValue;
  borderRightColor?: ColorValue;
  borderTopColor?: ColorValue;
  borderBottomColor?: ColorValue;
  borderStartColor?: ColorValue;
  borderEndColor?: ColorValue;

  borderStyle?: WithDefault<string, 'solid'>;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerButton');
