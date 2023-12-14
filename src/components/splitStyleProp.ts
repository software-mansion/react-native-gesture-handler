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

type BorderRadiiKey = keyof typeof STYLE_GROUPS.borderRadiiStyles;
type OuterKey = keyof typeof STYLE_GROUPS.outerStyles;
type InnerKey = keyof typeof STYLE_GROUPS.innerStyles;
type ApplyToAllKey = keyof typeof STYLE_GROUPS.applyToAllStyles;

type BorderRadiiStyles = Pick<ViewStyle, BorderRadiiKey>;
type OuterStyles = Pick<ViewStyle, OuterKey>;
type InnerStyles = Pick<ViewStyle, InnerKey>;
type ApplyToAllStyles = Pick<ViewStyle, ApplyToAllKey>;
type RestStyles = Omit<
  ViewStyle,
  BorderRadiiKey | OuterKey | InnerKey | ApplyToAllKey
>;

type GroupedStyles = {
  borderRadiiStyles: BorderRadiiStyles;
  outerStyles: OuterStyles;
  innerStyles: InnerStyles;
  applyToAllStyles: ApplyToAllStyles;
  restStyles: RestStyles;
};

const groupByStyle = (styles: ViewStyle): GroupedStyles => {
  const borderRadiiStyles = {} as Record<string, unknown>;
  const outerStyles = {} as Record<string, unknown>;
  const innerStyles = {} as Record<string, unknown>;
  const applyToAllStyles = {} as Record<string, unknown>;
  const restStyles = {} as Record<string, unknown>;

  let key: keyof ViewStyle;

  for (key in styles) {
    if (key in STYLE_GROUPS.borderRadiiStyles) {
      borderRadiiStyles[key] = styles[key];
    } else if (key in STYLE_GROUPS.outerStyles) {
      outerStyles[key] = styles[key];
    } else if (key in STYLE_GROUPS.innerStyles) {
      innerStyles[key] = styles[key];
    } else if (key in STYLE_GROUPS.applyToAllStyles) {
      applyToAllStyles[key] = styles[key];
    } else {
      restStyles[key] = styles[key];
    }
  }

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
  borderRadiiStyles: BorderRadiiStyles,
  borderWidth: number
) => {
  const newBorderRadiiStyles = { ...borderRadiiStyles };

  let borderRadiusType: BorderRadiiKey;

  for (borderRadiusType in newBorderRadiiStyles) {
    newBorderRadiiStyles[borderRadiusType] =
      (newBorderRadiiStyles[borderRadiusType] as number) - borderWidth;
  }

  return newBorderRadiiStyles;
};

export function splitStyleProp<T extends ViewStyle>(
  style?: StyleProp<T>
): {
  outerStyles: T;
  innerStyles: T;
  restStyles: T;
} {
  const resolvedStyle = StyleSheet.flatten((style ?? {}) as ViewStyle);

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
