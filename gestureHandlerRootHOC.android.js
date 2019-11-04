import React from 'react';
import PropTypes from "prop-types";
import {
  requireNativeComponent,
  StyleSheet,
  ViewPropTypes,
} from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';

const iface = {
  name: 'GestureHandlerRootView',
  propTypes: {
    interceptTouchOutside: PropTypes.bool,
    ...ViewPropTypes,
  },
};

const GestureHandlerRootView = requireNativeComponent(
  'GestureHandlerRootView',
  iface
);

export default function gestureHandlerRootHOC(
  Component,
  {
    containerStyles = undefined,
    interceptTouchOutside = false
  }
) {
  class Wrapper extends React.Component {
    render() {
      return (
        <GestureHandlerRootView
          style={[styles.container, containerStyles]}
          interceptTouchOutside={interceptTouchOutside}
        >
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
