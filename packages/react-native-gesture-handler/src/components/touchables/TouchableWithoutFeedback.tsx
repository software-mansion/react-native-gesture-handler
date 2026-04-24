import type { PropsWithChildren } from 'react';
import * as React from 'react';

import GenericTouchable from './GenericTouchable';
import type { GenericTouchableProps } from './GenericTouchableProps';

/**
 * @deprecated TouchableWithoutFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
export type TouchableWithoutFeedbackProps = GenericTouchableProps;

/**
 * @deprecated TouchableWithoutFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
const TouchableWithoutFeedback = ({
  delayLongPress = 600,
  extraButtonProps = {
    rippleColor: 'transparent',
    exclusive: true,
  },
  ...rest
}: PropsWithChildren<TouchableWithoutFeedbackProps> & {
  ref?: React.Ref<GenericTouchable>;
}) => (
  <GenericTouchable
    delayLongPress={delayLongPress}
    extraButtonProps={extraButtonProps}
    {...rest}
  />
);

export default TouchableWithoutFeedback;
