import * as React from 'react';
import { Insets, View } from '../ReactCompat';
import { RawButtonProps } from './GestureButtons';

interface RawButtonWebProps extends RawButtonProps {
  hitSlop?: Insets | undefined;
}

export default React.forwardRef<View, { rippleColor: any }>(
  (props: RawButtonWebProps, ref) => (
    <View ref={ref} accessibilityRole="button" {...props} />
  )
);
