import React from 'react';
import GenericTouchable, { GenericTouchableProps } from './GenericTouchable';

// TODO: it might give wrong type to users
const TouchableWithoutFeedback = React.forwardRef<
  GenericTouchable,
  GenericTouchableProps
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
