import * as React from 'react';
import { PropsWithChildren } from 'react';
import GenericTouchable from './GenericTouchable';
import type { GenericTouchableProps } from './GenericTouchableProps';

/**
 * @deprecated TouchableWithoutFeedback will be removed in Gesture Handler 4
 */
export type TouchableWithoutFeedbackProps = GenericTouchableProps;

/**
 * @deprecated TouchableWithoutFeedback will be removed in Gesture Handler 4
 */
const TouchableWithoutFeedback = React.forwardRef<
  GenericTouchable,
  PropsWithChildren<TouchableWithoutFeedbackProps>
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
