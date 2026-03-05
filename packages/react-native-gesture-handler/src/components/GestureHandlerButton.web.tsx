import * as React from 'react';
import { View, ViewProps } from 'react-native';

type ButtonProps = ViewProps & {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
};

export const ButtonComponent = (props: ButtonProps) => (
  <View accessibilityRole="button" {...props} />
);

export default ButtonComponent;
