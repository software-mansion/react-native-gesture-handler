import React from 'react';
import { NativeModules } from 'react-native';

const { RNGestureHandlerModule, UIManager } = NativeModules;

// Wrap JS responder calls and notify gesture handler manager
const {
  setJSResponder: oldSetJSResponder,
  clearJSResponder: oldClearJSResponder,
} = UIManager;
UIManager.setJSResponder = (tag, blockNativeResponder) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
};
UIManager.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
};

// Add gesture specific events to RCTView's directEventTypes object exported via UIManager.
// Once new event types are registered with react it is possible to dispatch these to other
// view types as well.
UIManager.RCTView.directEventTypes = {
  ...UIManager.RCTView.directEventTypes,
  onGestureHandlerEvent: { registrationName: 'onGestureHandlerEvent' },
  onGestureHandlerStateChange: {
    registrationName: 'onGestureHandlerStateChange',
  },
};

export default {
  ...RNGestureHandlerModule,
  getChildren: props => {
    const child = React.Children.only(props.children);
    return child.props.children;
  },
  render: (handlerName, props) => {
    return React.Children.only(props.children);
  },
};
