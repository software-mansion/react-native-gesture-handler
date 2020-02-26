import React from 'react';
import { View } from 'react-native';

export default React.forwardRef(({onPress, ...props}, ref) => {
  return <View ref={ref} accessibilityRole={onPress ? "button" : undefined} onPress={onPress} {...props} />
});
