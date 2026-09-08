import * as React from 'react';
import { View } from 'react-native';

const GestureHandlerButton: React.ForwardRefExoticComponent<
  React.RefAttributes<React.ComponentRef<typeof View>>
> = React.forwardRef<React.ComponentRef<typeof View>>((props, ref) => (
  <View ref={ref} accessibilityRole="button" {...props} />
));

export default GestureHandlerButton;
