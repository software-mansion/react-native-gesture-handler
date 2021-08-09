import * as React from 'react';
import { PropsWithChildren } from 'react';
import { View, requireNativeComponent } from 'react-native';

const GestureHandlerEventReceiverViewNative = requireNativeComponent(
  'RNGestureHandlerEventReceiver'
);

export default React.forwardRef((props, ref) => {
  return <GestureHandlerEventReceiverViewNative ref={ref} {...props} />;
});
