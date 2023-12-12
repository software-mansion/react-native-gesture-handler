import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

const STYLE_GROUPS = {
  borderRadiiStyles: {
    borderRadius: true,
    borderTopLeftRadius: true,
    borderTopRightRadius: true,
    borderBottomLeftRadius: true,
    borderBottomRightRadius: true,
  } as const,
  outerStyles: {
    borderColor: true,
    borderWidth: true,
    margin: true,
    marginBottom: true,
    marginEnd: true,
    marginHorizontal: true,
    marginLeft: true,
    marginRight: true,
    marginStart: true,
    marginTop: true,
    marginVertical: true,
    width: true,
    height: true,
  } as const,
  innerStyles: {
    alignSelf: true,
    display: true,
    flexBasis: true,
    flexGrow: true,
    flexShrink: true,
    maxHeight: true,
    maxWidth: true,
    minHeight: true,
    minWidth: true,
    zIndex: true,
  } as const,
  applyToAllStyles: {
    flex: true,
    position: true,
    left: true,
    right: true,
    top: true,
    bottom: true,
    start: true,
    end: true,
  } as const,
} as const;

const groupByStyle = (styles: ViewStyle) => {
  const borderRadiiStyles = {} as ViewStyle;
  const outerStyles = {} as ViewStyle;
  const innerStyles = {} as ViewStyle;
  const applyToAllStyles = {} as ViewStyle;
  const restStyles = {} as ViewStyle;

  Object.keys(styles).forEach((key) => {
    if (key in STYLE_GROUPS.borderRadiiStyles) {
      // @ts-ignore I can't
      borderRadiiStyles[key] = styles[key];
    } else if (key in STYLE_GROUPS.outerStyles) {
      // @ts-ignore figure out
      outerStyles[key] = styles[key];
    } else if (key in STYLE_GROUPS.innerStyles) {
      // @ts-ignore how to
      innerStyles[key] = styles[key];
    } else if (key in STYLE_GROUPS.applyToAllStyles) {
      // @ts-ignore fix these
      applyToAllStyles[key] = styles[key];
    } else {
      // @ts-ignore types
      restStyles[key] = styles[key];
    }
  });

  return {
    borderRadiiStyles,
    outerStyles,
    innerStyles,
    applyToAllStyles,
    restStyles,
  };
};

// if borderWidth was specified it will adjust the border radii
// to remain the same curvature for both inner and outer views
// https://twitter.com/lilykonings/status/1567317037126680576
const shrinkBorderRadiiByBorderWidth = (
  borderRadiiStyles: ViewStyle,
  borderWidth: number
) => {
  const newBorderRadiiStyles = { ...borderRadiiStyles };

  Object.keys(STYLE_GROUPS.borderRadiiStyles).forEach((borderRadiusType) => {
    if (borderRadiusType in newBorderRadiiStyles) {
      // @ts-ignore it's fine
      newBorderRadiiStyles[borderRadiusType] -= borderWidth;
    }
  });

  return newBorderRadiiStyles;
};

export function splitStyleProp<T extends ViewStyle>(
  style?: StyleProp<T>
): {
  outerStyles: T;
  innerStyles: T;
  restStyles: T;
} {
  const resolvedStyle = StyleSheet.flatten(style ?? {});

  let outerStyles = {} as T;
  let innerStyles = { overflow: 'hidden', flexGrow: 1 } as T;
  let restStyles = { flexGrow: 1 } as T;

  const styleGroups = groupByStyle(resolvedStyle);

  outerStyles = {
    ...outerStyles,
    ...styleGroups.borderRadiiStyles,
    ...styleGroups.applyToAllStyles,
    ...styleGroups.outerStyles,
  };
  innerStyles = {
    ...innerStyles,
    ...styleGroups.applyToAllStyles,
    ...styleGroups.innerStyles,
  };
  restStyles = {
    ...restStyles,
    ...styleGroups.restStyles,
    ...styleGroups.applyToAllStyles,
  };

  // if borderWidth was specified it adjusts border radii
  //  to remain the same curvature for both inner and outer views
  if (styleGroups.outerStyles.borderWidth != null) {
    const { borderWidth } = styleGroups.outerStyles;

    const innerBorderRadiiStyles = shrinkBorderRadiiByBorderWidth(
      { ...styleGroups.borderRadiiStyles },
      borderWidth
    );

    innerStyles = { ...innerStyles, ...innerBorderRadiiStyles };
  }

  return { outerStyles, innerStyles, restStyles };
}
