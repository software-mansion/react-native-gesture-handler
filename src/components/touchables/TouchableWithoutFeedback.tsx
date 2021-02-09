import React from 'react';
import GenericTouchable, { GenericTouchableProps } from './GenericTouchable';

const TouchableWithoutFeedback = React.forwardRef<
  GenericTouchable,
  GenericTouchableProps
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
