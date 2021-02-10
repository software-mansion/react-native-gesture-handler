import * as React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';
import GestureHandlerRootView from './GestureHandlerRootView';

export default function gestureHandlerRootHOC(
  Component: React.ComponentType<Record<string, unknown>>,
  containerStyles?: StyleProp<ViewStyle>
): React.ComponentType<Record<string, unknown>> {
  function Wrapper(props: Record<string, unknown>) {
    return (
      <GestureHandlerRootView style={[styles.container, containerStyles]}>
        <Component {...props} />
      </GestureHandlerRootView>
    );
  }

  Wrapper.displayName = `gestureHandlerRootHOC(${
    Component.displayName || Component.name
  })`;

  hoistNonReactStatics(Wrapper, Component);

  return Wrapper;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
