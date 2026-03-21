import {
  AccessibilityProps,
  ColorValue,
  HostComponent,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import RNGestureHandlerButtonNativeComponent from '../specs/RNGestureHandlerButtonNativeComponent';
import RNGestureHandlerButtonWrapperNativeComponent from '../specs/RNGestureHandlerButtonWrapperNativeComponent';
import { useMemo } from 'react';

export interface ButtonProps extends ViewProps, AccessibilityProps {
  children?: React.ReactNode;

  /**
   * Defines if buttons should respond to touches. By default set to true.
   */
  enabled?: boolean | undefined;

  /**
   * Defines if more than one button could be pressed simultaneously. By default
   * set true.
   */
  exclusive?: boolean | undefined;

  /**
   * Android only.
   *
   * Defines color of native ripple animation used since API level 21.
   */
  rippleColor?: number | ColorValue | null | undefined;

  /**
   * Android only.
   *
   * Defines radius of native ripple animation used since API level 21.
   */
  rippleRadius?: number | null | undefined;

  /**
   * Android only.
   *
   * Set this to true if you want the ripple animation to render outside the view bounds.
   */
  borderless?: boolean | undefined;

  /**
   * Android only.
   *
   * Defines whether the ripple animation should be drawn on the foreground of the view.
   */
  foreground?: boolean | undefined;

  /**
   * Android only.
   *
   * Set this to true if you don't want the system to play sound when the button is pressed.
   */
  touchSoundDisabled?: boolean | undefined;

  /**
   * Style object, use it to set additional styles.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Invoked on mount and layout changes.
   */
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPress?: Function | null | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPressIn?: Function | null | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onPressOut?: Function | null | undefined;

  /**
   * Used for testing-library compatibility, not passed to the native component.
   * @deprecated test-only props are deprecated and will be removed in the future.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  testOnly_onLongPress?: Function | null | undefined;
}

export const ButtonComponent =
  RNGestureHandlerButtonNativeComponent as HostComponent<ButtonProps>;

export default function GestureHandlerButton({
  borderless,
  style,
  ...rest
}: ButtonProps) {
  const flattenedStyle = useMemo(() => StyleSheet.flatten(style), [style]);

  const {
    // Layout properties
    display,
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    alignContent,
    alignSelf,
    aspectRatio,
    gap,
    rowGap,
    columnGap,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginVertical,
    marginHorizontal,
    marginStart,
    marginEnd,
    padding,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingVertical,
    paddingHorizontal,
    paddingStart,
    paddingEnd,
    position,
    top,
    right,
    bottom,
    left,
    start,
    end,
    overflow,

    // Visual properties
    ...restStyle
  } = flattenedStyle;

  // Layout styles for ButtonComponent
  const layoutStyle = useMemo(
    () => ({
      display,
      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      flex,
      flexGrow,
      flexShrink,
      flexBasis,
      flexDirection,
      flexWrap,
      justifyContent,
      alignItems,
      alignContent,
      alignSelf,
      aspectRatio,
      gap,
      rowGap,
      columnGap,
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      marginVertical,
      marginHorizontal,
      marginStart,
      marginEnd,
      padding,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingVertical,
      paddingHorizontal,
      paddingStart,
      paddingEnd,
      position,
      top,
      right,
      bottom,
      left,
      start,
      end,
      overflow,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flattenedStyle]
  );

  return (
    <RNGestureHandlerButtonWrapperNativeComponent style={styles.contents}>
      <View
        collapsable={false}
        style={[
          styles.contents,
          !borderless &&
            (!overflow || overflow === 'hidden') &&
            styles.overflowHidden,
          restStyle,
        ]}>
        <ButtonComponent
          {...rest}
          style={layoutStyle}
          borderless={borderless}
        />
      </View>
    </RNGestureHandlerButtonWrapperNativeComponent>
  );
}

const styles = StyleSheet.create({
  contents: {
    display: 'contents',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
});
