import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

const STYLE_GROUPS = {
  borderRadiiStyles: [
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ],
  outerStyles: [
    'borderColor',
    'borderWidth',
    'margin',
    'marginBottom',
    'marginEnd',
    'marginHorizontal',
    'marginLeft',
    'marginRight',
    'marginStart',
    'marginTop',
    'marginVertical',
    'width',
    'height',
  ],
  innerStyles: [
    'alignSelf',
    'display',
    'flexBasis',
    'flexGrow',
    'flexShrink',
    'maxHeight',
    'maxWidth',
    'minHeight',
    'minWidth',
    'zIndex',
  ],
  applyToAllStyles: [
    'flex',
    'position',
    'left',
    'right',
    'top',
    'bottom',
    'start',
    'end',
  ],
} as const;

const groupByStyle = (styles: ViewStyle) => {
  const borderRadiiStyles = {} as ViewStyle;
  const outerStyles = {} as ViewStyle;
  const innerStyles = {} as ViewStyle;
  const applyToAllStyles = {} as ViewStyle;
  const restStyles = {} as ViewStyle;

  Object.keys(styles).forEach((key) => {
    if (STYLE_GROUPS.borderRadiiStyles.includes(key)) {
      borderRadiiStyles[key] = styles[key];
    } else if (STYLE_GROUPS.outerStyles.includes(key)) {
      outerStyles[key] = styles[key];
    } else if (STYLE_GROUPS.innerStyles.includes(key)) {
      innerStyles[key] = styles[key];
    } else if (STYLE_GROUPS.applyToAllStyles.includes(key)) {
      applyToAllStyles[key] = styles[key];
    } else {
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

// to remain the same curvature of both inner and outer corners
// https://twitter.com/lilykonings/status/1567317037126680576
const shrinkBorderRadiiByBorderWidth = (
  borderRadiiStyles: ViewStyle,
  borderWidth: number
) => {
  const newBorderRadiiStyles = { ...borderRadiiStyles };

  STYLE_GROUPS.borderRadiiStyles.forEach((borderRadiusType) => {
    if (newBorderRadiiStyles.hasOwnProperty(borderRadiusType)) {
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
