import React from 'react';
import { TouchableOpacity } from 'react-native';

// Use TouchableOpacity with the transparency disabled to most closely emulate
// the native view's ability to wrap children and apply styles.
export default React.forwardRef((props, ref) => (
  <TouchableOpacity
    ref={ref}
    accessibilityRole="button"
    {...props}
    activeOpacity={1.0}
    focusOpacity={1.0}
  />
));
