import * as React from 'react';
import { View } from 'react-native';

export default React.forwardRef<React.ComponentRef<typeof View>>(
  (props, ref) => <View ref={ref} accessibilityRole="button" {...props} />
);
