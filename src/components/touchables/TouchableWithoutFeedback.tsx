import * as React from 'react';
import { PropsWithChildren } from 'react';
import GenericTouchable, { GenericTouchableProps } from './GenericTouchable';
import { forwardRef } from '../../forwardRefCompat';

export type TouchableWithoutFeedbackProps = GenericTouchableProps;

const TouchableWithoutFeedback = forwardRef<
  GenericTouchable,
  PropsWithChildren<TouchableWithoutFeedbackProps>
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
