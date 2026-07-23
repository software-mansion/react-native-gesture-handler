import type {
  CodegenTypes,
  ColorValue,
  HostComponent,
  ViewProps,
} from 'react-native';
import { codegenNativeComponent } from 'react-native';

export type ButtonEvent = Readonly<{
  pointerInside: boolean;
  x: CodegenTypes.Double;
  y: CodegenTypes.Double;
  absoluteX: CodegenTypes.Double;
  absoluteY: CodegenTypes.Double;
  numberOfPointers: CodegenTypes.Int32;
  pointerType: CodegenTypes.Int32;
}>;

// @ts-ignore - Redefining pointerEvents with WithDefault for codegen, conflicts with ViewProps type but codegen needs it
interface NativeProps extends ViewProps {
  onPress?: CodegenTypes.DirectEventHandler<ButtonEvent> | undefined;
  onPressIn?: CodegenTypes.DirectEventHandler<ButtonEvent> | undefined;
  onPressOut?: CodegenTypes.DirectEventHandler<ButtonEvent> | undefined;
  onLongPress?: CodegenTypes.DirectEventHandler<ButtonEvent> | undefined;
  onInteractionFinished?:
    | CodegenTypes.DirectEventHandler<ButtonEvent>
    | undefined;

  hasLongPressHandler?: CodegenTypes.WithDefault<boolean, false>;
  exclusive?: CodegenTypes.WithDefault<boolean, true>;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: CodegenTypes.WithDefault<boolean, true>;
  rippleColor?: ColorValue;
  rippleRadius?: CodegenTypes.Int32;
  touchSoundDisabled?: CodegenTypes.WithDefault<boolean, false>;
  pointerEvents?: CodegenTypes.WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
  tapAnimationInDuration?: CodegenTypes.WithDefault<CodegenTypes.Int32, 50>;
  tapAnimationOutDuration?: CodegenTypes.WithDefault<CodegenTypes.Int32, 100>;
  longPressDuration?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  longPressAnimationOutDuration?: CodegenTypes.WithDefault<
    CodegenTypes.Int32,
    -1
  >;
  needsOffscreenAlphaCompositing?: CodegenTypes.WithDefault<boolean, false>;
  activeOpacity?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  activeScale?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  activeUnderlayOpacity?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  // Hover values default to -1 as an "unset" sentinel; the native side
  // resolves them to the corresponding default* value (matching web, where
  // an omitted hover value falls back to its default counterpart).
  hoverOpacity?: CodegenTypes.WithDefault<CodegenTypes.Float, -1>;
  hoverScale?: CodegenTypes.WithDefault<CodegenTypes.Float, -1>;
  hoverUnderlayOpacity?: CodegenTypes.WithDefault<CodegenTypes.Float, -1>;
  hoverAnimationInDuration?: CodegenTypes.WithDefault<CodegenTypes.Int32, 50>;
  hoverAnimationOutDuration?: CodegenTypes.WithDefault<CodegenTypes.Int32, 100>;
  defaultOpacity?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  defaultScale?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  defaultUnderlayOpacity?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  underlayColor?: ColorValue;

  // Border style
  borderWidth?: CodegenTypes.Float;
  borderColor?: ColorValue;
  borderStyle?: CodegenTypes.WithDefault<string, 'solid'>;
  overflow?: CodegenTypes.WithDefault<string, 'visible'>;

  // Border width per-edge
  borderLeftWidth?: CodegenTypes.Float;
  borderRightWidth?: CodegenTypes.Float;
  borderTopWidth?: CodegenTypes.Float;
  borderBottomWidth?: CodegenTypes.Float;
  borderStartWidth?: CodegenTypes.Float;
  borderEndWidth?: CodegenTypes.Float;

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
  borderRadius?: CodegenTypes.UnsafeMixed;
  borderTopLeftRadius?: CodegenTypes.UnsafeMixed;
  borderTopRightRadius?: CodegenTypes.UnsafeMixed;
  borderBottomLeftRadius?: CodegenTypes.UnsafeMixed;
  borderBottomRightRadius?: CodegenTypes.UnsafeMixed;
  borderTopStartRadius?: CodegenTypes.UnsafeMixed;
  borderTopEndRadius?: CodegenTypes.UnsafeMixed;
  borderBottomStartRadius?: CodegenTypes.UnsafeMixed;
  borderBottomEndRadius?: CodegenTypes.UnsafeMixed;
  borderEndEndRadius?: CodegenTypes.UnsafeMixed;
  borderEndStartRadius?: CodegenTypes.UnsafeMixed;
  borderStartEndRadius?: CodegenTypes.UnsafeMixed;
  borderStartStartRadius?: CodegenTypes.UnsafeMixed;
}

export default codegenNativeComponent<NativeProps>(
  'RNGestureHandlerButton'
) as HostComponent<NativeProps>;
