import React from 'react';
import { View } from 'react-native';

export default React.forwardRef(({enabled, onPress, ...props}, ref) => {
  const isPressable = enabled && !!onPress
  
  return <View ref={ref} accessibilityRole={isPressable ? "button" : undefined} onPress={onPress} {...props} />
});
