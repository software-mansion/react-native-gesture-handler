import * as React from 'react';
import { View } from 'react-native';
import { forwardRef } from '../forwardRefCompat';

export default forwardRef<View>((props, ref) => (
  <View ref={ref} accessibilityRole="button" {...props} />
));
