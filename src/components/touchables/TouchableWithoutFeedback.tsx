import * as React from 'react';
import { PropsWithChildren } from 'react';
import GenericTouchable, { GenericTouchableProps } from './GenericTouchable';

export type TouchableWithoutFeedbackProps = GenericTouchable;

const TouchableWithoutFeedback = React.forwardRef<
  TouchableWithoutFeedbackProps,
  PropsWithChildren<GenericTouchableProps>
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
