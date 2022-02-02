import * as React from 'react';
import { requireNativeComponent } from 'react-native';
const GestureHandlerRootViewNative = requireNativeComponent('GestureHandlerRootView');
export default function GestureHandlerRootView({
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(GestureHandlerRootViewNative, rest, children);
}
//# sourceMappingURL=GestureHandlerRootView.android.js.map