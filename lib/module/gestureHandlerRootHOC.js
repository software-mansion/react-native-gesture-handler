import * as React from 'react';
import { StyleSheet } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';
import GestureHandlerRootView from './GestureHandlerRootView';
export default function gestureHandlerRootHOC(Component, containerStyles) {
  function Wrapper(props) {
    return /*#__PURE__*/React.createElement(GestureHandlerRootView, {
      style: [styles.container, containerStyles]
    }, /*#__PURE__*/React.createElement(Component, props));
  }

  Wrapper.displayName = `gestureHandlerRootHOC(${Component.displayName || Component.name})`;
  hoistNonReactStatics(Wrapper, Component);
  return Wrapper;
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=gestureHandlerRootHOC.js.map