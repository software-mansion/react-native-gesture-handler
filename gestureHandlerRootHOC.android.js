import React from 'react';
import { requireNativeComponent, View, StyleSheet } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';

var iface = {
  name: 'GestureHandlerRootView',
  propTypes: {
    ...View.propTypes,
  },
};

const GestureHandlerRootView = requireNativeComponent(
  'GestureHandlerRootView',
  iface
);

export default function gestureHandlerRootHOC(
  Component,
  containerStyles = undefined
) {
  class Wrapper extends React.Component {
    render() {
      return (
        <GestureHandlerRootView style={[styles.container, containerStyles]}>
          <Component {...this.props} />
        </GestureHandlerRootView>
      );
    }
  }
  hoistNonReactStatics(Wrapper, Component);
  return Wrapper;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
