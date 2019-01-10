import React from 'react';
import {
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
  FlatList,
  TouchableWithoutFeedback,
  findNodeHandle,
} from 'react-native';
import gestureHandlerRootHOC from './gestureHandlerRootHOC';
import Directions from './Directions';
import State from './State';

// Factory for Handler components
function createHandler(name, attachNativeHandler) {
  return class Handler extends React.Component {
    static displayName = name;

    container = React.createRef();
    detachNativeHandler = null;

    componentDidMount() {
      // Get current DOM node
      const node = findNodeHandle(this.container.current);

      // Attach handler to DOM node
      const { enabled } = this.props;
      if (node && attachNativeHandler && enabled !== false) {
        this.detachNativeHandler = attachNativeHandler(node, this.props);
      }
    }

    componentDidUpdate() {
      // Get current DOM node
      const node = findNodeHandle(this.container.current);

      if (node && attachNativeHandler) {
        // Detach existing handlers
        if (this.detachNativeHandler) {
          this.detachNativeHandler(node);
        }

        // Attach handler to DOM node again
        const { enabled } = this.props;
        if (enabled !== false) {
          attachNativeHandler(node, this.props);
        }
      }
    }

    setNativeProps() {
      // No implementation so far but is needed to avoid null calls
    }

    render() {
      const { children, ...rest } = this.props;

      // We don't want to create another layer, so instead we clone it only but keep the reference
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        ref: this.container,
        ...rest,
      });
    }
  };
}

// Create all Handler components with their respective handler functions
// (at the moment only TapGestureHandler is properly supported)
const NativeViewGestureHandler = createHandler('NativeViewGestureHandler');
const TapGestureHandler = createHandler('TapGestureHandler', (node, props) => {
  const { onHandlerStateChange = () => {} } = props;
  const clickHandler = ({ x }) =>
    onHandlerStateChange({
      nativeEvent: {
        oldState: State.ACTIVE,
        state: State.UNDETERMINED,
        x,
      },
    });
  node.addEventListener('click', clickHandler);

  // Detach event listeners
  return () => {
    node.removeEventListener('click', clickHandler);
  };
});
const FlingGestureHandler = createHandler('FlingGestureHandler');
const ForceTouchGestureHandler = createHandler('ForceTouchGestureHandler');
const LongPressGestureHandler = createHandler('LongPressGestureHandler');
const PanGestureHandler = createHandler('PanGestureHandler');
const PinchGestureHandler = createHandler('PinchGestureHandler');
const RotationGestureHandler = createHandler('RotationGestureHandler');

// Factory for Button component
// (at the moment this is a plain TouchableWithoutFeedback)
function createButton(name) {
  return class Button extends React.Component {
    static displayName = name;

    render() {
      return <TouchableWithoutFeedback {...this.props} />;
    }
  };
}

const RawButton = createButton('RawButton');
const BaseButton = createButton('BaseButton');
const RectButton = createButton('RectButton');
const BorderlessButton = createButton('BorderlessButton');

// Export same components as in GestureHandler.js
export {
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
  NativeViewGestureHandler,
  TapGestureHandler,
  FlingGestureHandler,
  ForceTouchGestureHandler,
  LongPressGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
  /* Buttons */
  RawButton,
  BaseButton,
  RectButton,
  BorderlessButton,
  /* Other */
  FlatList,
  gestureHandlerRootHOC,
  Directions,
};
