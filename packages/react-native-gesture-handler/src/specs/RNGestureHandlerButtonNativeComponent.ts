import { codegenNativeComponent } from 'react-native';
import type {
  CodegenTypes,
  HostComponent,
  ViewProps,
  ColorValue,
} from 'react-native';

// @ts-ignore - Redefining pointerEvents with WithDefault for codegen, conflicts with ViewProps type but codegen needs it
interface NativeProps extends ViewProps {
  exclusive?: CodegenTypes.WithDefault<boolean, true>;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: CodegenTypes.WithDefault<boolean, true>;
  rippleColor?: ColorValue;
  rippleRadius?: CodegenTypes.Int32;
  touchSoundDisabled?: CodegenTypes.WithDefault<boolean, false>;
  borderWidth?: CodegenTypes.Float;
  borderColor?: ColorValue;
  borderStyle?: CodegenTypes.WithDefault<string, 'solid'>;
  pointerEvents?: CodegenTypes.WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
}

export default codegenNativeComponent<NativeProps>(
  'RNGestureHandlerButton'
) as HostComponent<NativeProps>;
