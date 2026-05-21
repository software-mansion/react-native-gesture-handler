import type { ColorValue, ViewProps } from 'react-native';
import type {
  Float,
  Int32,
  UnsafeMixed,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

// @ts-ignore - Redefining pointerEvents with WithDefault for codegen, conflicts with ViewProps type but codegen needs it
interface NativeProps extends ViewProps {
  exclusive?: WithDefault<boolean, true>;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: WithDefault<boolean, true>;
  rippleColor?: ColorValue;
  rippleRadius?: Int32;
  touchSoundDisabled?: WithDefault<boolean, false>;
  pointerEvents?: WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
  tapAnimationInDuration?: WithDefault<Int32, 50>;
  tapAnimationOutDuration?: WithDefault<Int32, 100>;
  longPressDuration?: WithDefault<Int32, -1>;
  longPressAnimationOutDuration?: WithDefault<Int32, -1>;
  activeOpacity?: WithDefault<Float, 1>;
  activeScale?: WithDefault<Float, 1>;
  activeUnderlayOpacity?: WithDefault<Float, 0>;
  defaultOpacity?: WithDefault<Float, 1>;
  defaultScale?: WithDefault<Float, 1>;
  defaultUnderlayOpacity?: WithDefault<Float, 0>;
  underlayColor?: ColorValue;

  // Border style
  borderWidth?: Float;
  borderColor?: ColorValue;
  borderStyle?: WithDefault<string, 'solid'>;
  overflow?: WithDefault<string, 'visible'>;

  // Border width per-edge
  borderLeftWidth?: Float;
  borderRightWidth?: Float;
  borderTopWidth?: Float;
  borderBottomWidth?: Float;
  borderStartWidth?: Float;
  borderEndWidth?: Float;

  // Border color per-edge
  borderLeftColor?: ColorValue;
  borderRightColor?: ColorValue;
  borderTopColor?: ColorValue;
  borderBottomColor?: ColorValue;
  borderStartColor?: ColorValue;
  borderEndColor?: ColorValue;
  borderBlockColor?: ColorValue;
  borderBlockEndColor?: ColorValue;
  borderBlockStartColor?: ColorValue;

  // Border radius — declared as UnsafeMixed (folly::dynamic on iOS,
  // DynamicFromObject on Android) so codegen forwards the raw value
  // without coercing to Float. This lets the Android view manager parse
  // both numeric points and percentage strings via
  // LengthPercentage.setFromDynamic, matching RN's standard View. The
  // non-logical variants are declared explicitly so they're dispatched
  // through our delegate instead of falling through to
  // BaseViewManagerDelegate, which casts to Double and would crash on a
  // string value.
  borderRadius?: UnsafeMixed;
  borderTopLeftRadius?: UnsafeMixed;
  borderTopRightRadius?: UnsafeMixed;
  borderBottomLeftRadius?: UnsafeMixed;
  borderBottomRightRadius?: UnsafeMixed;
  borderTopStartRadius?: UnsafeMixed;
  borderTopEndRadius?: UnsafeMixed;
  borderBottomStartRadius?: UnsafeMixed;
  borderBottomEndRadius?: UnsafeMixed;
  borderEndEndRadius?: UnsafeMixed;
  borderEndStartRadius?: UnsafeMixed;
  borderStartEndRadius?: UnsafeMixed;
  borderStartStartRadius?: UnsafeMixed;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerButton');
