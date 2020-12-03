import React from 'react';
import { TouchableWithoutFeedbackProps } from 'react-native';
import GenericTouchable, { GenericTouchableProps } from './GenericTouchable';

// TODO: type it properly somehow
// @ts-ignore
const TouchableWithoutFeedback: React.Component<
  TouchableWithoutFeedbackProps & GenericTouchableProps
> & {
  defaultProps: typeof GenericTouchable.defaultProps;
} = React.forwardRef<GenericTouchable, GenericTouchableProps>((props, ref) => (
  <GenericTouchable ref={ref} {...props} />
));

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
