import * as React from 'react';
import { View } from '../ReactCompat';

export default React.forwardRef<View>((props, ref) => (
  <View ref={ref} accessibilityRole="button" {...props} />
));
