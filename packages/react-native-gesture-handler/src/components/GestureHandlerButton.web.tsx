import * as React from 'react';
import { View, ViewProps } from 'react-native';

export const ButtonComponent = (
  props: ViewProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }
) => {
  return <View accessibilityRole="button" {...props} />;
};

export default ButtonComponent;
