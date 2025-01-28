import * as React from 'react';
import { PropsWithChildren } from 'react';
import GenericTouchable from './GenericTouchable';
import type { GenericTouchableProps } from './GenericTouchableProps';

export type TouchableWithoutFeedbackProps = GenericTouchableProps;

const TouchableWithoutFeedback = React.forwardRef<
  GenericTouchable,
  PropsWithChildren<TouchableWithoutFeedbackProps>
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
