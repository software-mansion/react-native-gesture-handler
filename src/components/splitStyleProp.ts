import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

const BORDERS: { [key in keyof ViewStyle]?: true } = {
  borderColor: true,
  borderWidth: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  borderBottomLeftRadius: true,
  borderBottomRightRadius: true,

  margin: true,
  marginBottom: true,
  marginEnd: true,
  marginHorizontal: true,
  marginLeft: true,
  marginRight: true,
  marginStart: true,
  marginTop: true,
  marginVertical: true,
};

const INNER_STYLES: { [key in keyof ViewStyle]?: true } = {
  alignSelf: true,
  display: true,
  flexBasis: true,
  flexGrow: true,
  flexShrink: true,
  maxHeight: true,
  maxWidth: true,
  minHeight: true,
  minWidth: true,

  width: true,
  zIndex: true,
};

const BOTH_STYLES: { [key in keyof ViewStyle]?: true } = {
  flex: true,

  position: true,
  left: true,
  right: true,
  top: true,
  bottom: true,
  start: true,
  end: true,
};

export function splitStyleProp<T extends ViewStyle>(style?: StyleProp<T>): any {
  const resolvedStyle = StyleSheet.flatten(style ?? {});

  const borders: Record<string, unknown> = {};
  const innerStyles: Record<string, unknown> = {};
  const bothStyles: Record<string, unknown> = {};
  const restStyles: Record<string, unknown> = {};

  Object.entries(resolvedStyle).forEach(([key, value]) => {
    if ((BORDERS as { [key: string]: true | undefined })[key] === true) {
      borders[key] = value;
    } else if (
      (BOTH_STYLES as { [key: string]: true | undefined })[key] === true
    ) {
      bothStyles[key] = value;
    } else if (
      (INNER_STYLES as { [key: string]: true | undefined })[key] === true
    ) {
      innerStyles[key] = value;
    } else {
      restStyles[key] = value;
    }
  });

  return { borders, restStyles, innerStyles, bothStyles };
}
