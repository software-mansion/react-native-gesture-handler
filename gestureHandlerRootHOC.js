import React from 'react';
import { StyleSheet } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';
import GestureHandlerRootView from './GestureHandlerRootView';

export default function gestureHandlerRootHOC(
  Component,
  containerStyles = undefined
) {
  function Wrapper() {
    return (
      <GestureHandlerRootView style={[styles.container, containerStyles]}>
        <Component {...this.props} />
      </GestureHandlerRootView>
    );
  }

  Wrapper.displayName = `gestureHandlerRootHOC(${Component.displayName ||
    Component.name})`;

  hoistNonReactStatics(Wrapper, Component);

  return Wrapper;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
