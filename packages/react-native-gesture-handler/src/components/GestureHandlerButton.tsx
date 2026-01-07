import { HostComponent, StyleSheet, View } from 'react-native';
import type { RawButtonProps } from '../v3/components/GestureButtonsProps';
import RNGestureHandlerButtonNativeComponent from '../specs/RNGestureHandlerButtonNativeComponent';
import RNGestureHandlerButtonWrapperNativeComponent from '../specs/RNGestureHandlerButtonWrapperNativeComponent';
import { useMemo } from 'react';

const ButtonComponent =
  RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;

export default function GestureHandlerButton({
  style,
  ...rest
}: RawButtonProps) {
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
          (!overflow || overflow === 'hidden') && styles.overflowHidden,
          restStyle,
        ]}>
        <ButtonComponent {...rest} style={layoutStyle} />
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
