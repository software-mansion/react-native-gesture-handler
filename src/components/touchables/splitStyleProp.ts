import { FlexStyle, StyleProp, StyleSheet } from 'react-native';

const OUTER_PROPS: { [key in keyof FlexStyle]?: true } = {
  alignSelf: true,
  bottom: true,
  display: true,
  end: true,
  flex: true,
  flexBasis: true,
  flexGrow: true,
  flexShrink: true,
  height: true,
  left: true,
  margin: true,
  marginBottom: true,
  marginEnd: true,
  marginHorizontal: true,
  marginLeft: true,
  marginRight: true,
  marginStart: true,
  marginTop: true,
  marginVertical: true,
  maxHeight: true,
  maxWidth: true,
  minHeight: true,
  minWidth: true,
  position: true,
  right: true,
  start: true,
  top: true,
  width: true,
  zIndex: true,
};

/**
 * Split a style prop between an "outer" and "inner" views in a way that makes it behave
 * as if it was a single view.
 *
 * @example
 * const { outer, inner } = splitStyleProp(style);
 * return (
 *   <View style={outer}>
 *     <View style={[{ flexGrow: 1 }, inner]} />
 *   </View>
 * );
 */
export default function splitStyleProp<T extends FlexStyle>(
  style?: StyleProp<T>
): { outer: T; inner: T } {
  const resolvedStyle = StyleSheet.flatten(style);
  const inner: Record<string, unknown> = {};
  const outer: Record<string, unknown> = {};
  Object.entries(resolvedStyle).forEach(([key, value]) => {
    if ((OUTER_PROPS as { [key: string]: true | undefined })[key] === true) {
      outer[key] = value;
    } else {
      inner[key] = value;
    }
  });
  return { outer: outer as T, inner: inner as T };
}
