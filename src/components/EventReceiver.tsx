import * as React from 'react';
import { requireNativeComponent } from 'react-native';

const GestureHandlerEventReceiverView = requireNativeComponent(
  'RNGestureHandlerEventReceiver'
);

export default React.forwardRef((props, ref) => {
  return <GestureHandlerEventReceiverView ref={ref} {...props} />;
});
