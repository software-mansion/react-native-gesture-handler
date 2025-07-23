import * as React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';
import GestureHandlerRootView from './GestureHandlerRootView';

/**
 * @deprecated `gestureHandlerRootHOC` is deprecated and will be removed in the future version of Gesture Handler.
 * Use `GestureHandlerRootView` instead.
 */
export default function gestureHandlerRootHOC<P extends object>(
  Component: React.ComponentType<P>,
  containerStyles?: StyleProp<ViewStyle>
): React.ComponentType<P> {
  function Wrapper(props: P) {
    return (
      <GestureHandlerRootView style={[styles.container, containerStyles]}>
        <Component {...props} />
      </GestureHandlerRootView>
    );
  }

  Wrapper.displayName = `gestureHandlerRootHOC(${
    Component.displayName || Component.name
  })`;

  // @ts-ignore - hoistNonReactStatics uses old version of @types/react
  hoistNonReactStatics(Wrapper, Component);

  return Wrapper;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
