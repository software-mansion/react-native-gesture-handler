import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  Int32,
  WithDefault,
  Float,
} from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps, ColorValue } from 'react-native';

// @ts-ignore - Redefining pointerEvents with WithDefault for codegen, conflicts with ViewProps type but codegen needs it
interface NativeProps extends ViewProps {
  exclusive?: WithDefault<boolean, true>;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: WithDefault<boolean, true>;
  rippleColor?: ColorValue;
  rippleRadius?: Int32;
  touchSoundDisabled?: WithDefault<boolean, false>;
  borderWidth?: Float;
  borderColor?: ColorValue;
  borderStyle?: WithDefault<string, 'solid'>;
  pointerEvents?: WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
  animationDuration?: WithDefault<Int32, 100>;
  activeOpacity?: WithDefault<Float, 1>;
  activeScale?: WithDefault<Float, 1>;
  activeUnderlayOpacity?: WithDefault<Float, 0>;
  defaultOpacity?: WithDefault<Float, 1>;
  defaultScale?: WithDefault<Float, 1>;
  defaultUnderlayOpacity?: WithDefault<Float, 0>;
  underlayColor?: ColorValue;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerButton');
