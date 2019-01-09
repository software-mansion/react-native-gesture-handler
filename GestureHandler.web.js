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
} from 'react-native';
import gestureHandlerRootHOC from './gestureHandlerRootHOC';

class Handler extends React.Component {
  render() {
    const { children, onHandlerStateChange } = this.props;

    return (
      <TouchableWithoutFeedback onPress={onHandlerStateChange}>
        {children}
      </TouchableWithoutFeedback>
    );
  }
}

class Button extends React.Component {
  render() {
    return <TouchableWithoutFeedback {...this.props} />;
  }
}

const State = {};

const Directions = {};

export {
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
  Handler as NativeViewGestureHandler,
  Handler as TapGestureHandler,
  Handler as FlingGestureHandler,
  Handler as ForceTouchGestureHandler,
  Handler as LongPressGestureHandler,
  Handler as PanGestureHandler,
  Handler as PinchGestureHandler,
  Handler as RotationGestureHandler,
  State,
  /* Buttons */
  Button as RawButton,
  Button as BaseButton,
  Button as RectButton,
  Button as BorderlessButton,
  /* Other */
  FlatList,
  gestureHandlerRootHOC,
  Directions,
};
