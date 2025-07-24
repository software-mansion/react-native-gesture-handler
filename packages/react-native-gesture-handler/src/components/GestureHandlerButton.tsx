import { HostComponent, StyleSheet, View } from 'react-native';
import type { RawButtonProps } from './GestureButtonsProps';
import RNGestureHandlerButtonNativeComponent from '../specs/RNGestureHandlerButtonNativeComponent';
import RNGestureHandlerButtonWrapperNativeComponent from '../specs/RNGestureHandlerButtonWrapperNativeComponent';

const ButtonComponent =
  RNGestureHandlerButtonNativeComponent as HostComponent<RawButtonProps>;

export default function GestureHandlerButton({
  style,
  ...rest
}: RawButtonProps) {
  const flattenedStyle = StyleSheet.flatten(style);

  const { width, height, ...restStyle } = flattenedStyle;

  return (
    <RNGestureHandlerButtonWrapperNativeComponent style={styles.contents}>
      <View collapsable={false} style={[styles.contents, restStyle]}>
        <ButtonComponent {...rest} style={{ width, height }} />
      </View>
    </RNGestureHandlerButtonWrapperNativeComponent>
  );
}

const styles = StyleSheet.create({
  contents: {
    display: 'contents',
  },
});
