import * as React from 'react';
import { PropsWithChildren } from 'react';
import GenericTouchable from './GenericTouchable';
import type { GenericTouchableProps } from './GenericTouchableProps';

/**
 * @deprecated TouchableWithoutFeedback will be removed in the future version of Gesture Handler.
 */
export type TouchableWithoutFeedbackProps = GenericTouchableProps;

/**
 * @deprecated TouchableWithoutFeedback will be removed in the future version of Gesture Handler.
 */
const TouchableWithoutFeedback = React.forwardRef<
  GenericTouchable,
  PropsWithChildren<TouchableWithoutFeedbackProps>
>((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

export default TouchableWithoutFeedback;
