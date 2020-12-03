import React from 'react';
import { TouchableWithoutFeedbackProps } from 'react-native';
import GenericTouchable, { GenericTouchableProps } from './GenericTouchable';

const TouchableWithoutFeedback: React.Component<TouchableWithoutFeedbackProps &
  GenericTouchableProps> = React.forwardRef((props, ref: React.Ref<TouchableWithoutFeedback>) => (
  <GenericTouchable ref={ref} {...props} />
);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
