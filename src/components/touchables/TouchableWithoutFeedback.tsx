import * as React from 'react';
import { PropsWithChildren } from 'react';
import GenericTouchable from './GenericTouchable';
import type { GenericTouchableProps } from './GenericTouchableProps';

export type TouchableWithoutFeedbackProps = GenericTouchableProps;

const TouchableWithoutFeedback = React.forwardRef<
  GenericTouchable,
  PropsWithChildren<TouchableWithoutFeedbackProps>
>(
  (
    {
      delayLongPress = 600,
      extraButtonProps = {
        rippleColor: 'transparent',
        exclusive: true,
      },
      ...rest
    },

    ref
  ) => (
    <GenericTouchable
      ref={ref}
      delayLongPress={delayLongPress}
      extraButtonProps={extraButtonProps}
      {...rest}
    />
  )
);

export default TouchableWithoutFeedback;
