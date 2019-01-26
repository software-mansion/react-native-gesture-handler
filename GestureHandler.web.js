import React from 'react';
import {
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import gestureHandlerRootHOC from './gestureHandlerRootHOC';
import Directions from './Directions';
import State from './State';

// Factory for stub Handler components
function createStubHandler(name) {
  return class NativeViewGestureHandler extends React.Component {
    static displayName = name;

    setNativeProps() {
      // Since this is a stub we do not need to pass on native props.
      // However, we need to implement it here to avoid null calls.
    }

    render() {
      return this.props.children;
    }
  };
}

// Create all Handler components with their respective handler functions
// (at the moment only TapGestureHandler is properly supported)
const NativeViewGestureHandler = createStubHandler('NativeViewGestureHandler');

class TapGestureHandler extends React.Component {
  static defaultProps = {
    numberOfTaps: 1,
    maxDurationMs: 500,
    maxDelayMs: 500,
    minPointers: 1,
    maxDeltaX: Number.MAX_SAFE_INTEGER,
    maxDeltaY: Number.MAX_SAFE_INTEGER,
    maxDist: Number.MAX_SAFE_INTEGER,
  };

  setNativeProps() {}

  isActivated = false;
  touchBank = [];
  timeout = null;

  clearState = () => {
    this.isActivated = false;
    this.touchBank = [];
    window.clearTimeout(this.timeout);
  };

  handleHandlerStateChange = nativeEvent => {
    const { enabled, onHandlerStateChange } = this.props;

    if (enabled !== false && onHandlerStateChange) {
      onHandlerStateChange({
        nativeEvent,
      });
    }
  };

  handleFailed = ({
    nativeEvent: {
      locationX: x,
      locationY: y,
      pageX: absoluteX,
      pageY: absoluteY,
    },
  }) => {
    this.clearState();
    this.handleHandlerStateChange({
      oldState: State.ACTIVE,
      state: State.FAILED,
      x,
      y,
      absoluteX,
      absoluteY,
    });
  };

  handleEnd = ({
    nativeEvent: {
      locationX: x,
      locationY: y,
      pageX: absoluteX,
      pageY: absoluteY,
    },
  }) => {
    this.clearState();
    this.handleHandlerStateChange({
      oldState: State.ACTIVE,
      state: State.END,
      x,
      y,
      absoluteX,
      absoluteY,
    });
  };

  handleActivate = ({
    nativeEvent: {
      locationX: x,
      locationY: y,
      pageX: absoluteX,
      pageY: absoluteY,
    },
  }) => {
    this.isActivated = true;
    this.handleHandlerStateChange({
      oldState: State.UNDETERMINED,
      state: State.ACTIVE,
      x,
      y,
      absoluteX,
      absoluteY,
    });
  };

  handlePressIn = event => {
    const { maxDelayMs } = this.props;

    if (!this.isActivated) {
      this.handleActivate(event);

      // Cancel if not finished in time
      this.timeout = window.setTimeout(() => {
        if (this.isActivated) {
          this.handleFailed(event);
        }
      }, maxDelayMs);
    }
  };

  handlePressOut = event => {
    const {
      touchHistory: { touchBank = [] },
    } = event;
    const { maxDeltaX, maxDeltaY, maxDurationMs, numberOfTaps } = this.props;

    this.touchBank = this.touchBank.concat(touchBank);

    // Check if all touches are valid
    const areTouchesValid = this.touchBank.every(touch => {
      const {
        currentPageX,
        currentPageY,
        currentTimeStamp,
        startPageX,
        startPageY,
        startTimeStamp,
      } = touch;

      // Check if touch took longer than it may
      if (startTimeStamp + maxDurationMs < currentTimeStamp) {
        return false;
      }

      // Check if touch moved too far away
      if (
        startPageX + maxDeltaX < currentPageX ||
        startPageX - maxDeltaX > currentPageX
      ) {
        return false;
      }

      // Check if touch moved too far away
      if (
        startPageY + maxDeltaY < currentPageY ||
        startPageY - maxDeltaY > currentPageY
      ) {
        return false;
      }

      return true;
    });

    // Check if all touches were valid and the necessary number of touches was achieved
    if (!areTouchesValid) {
      this.handleFailed(event);
    } else if (this.touchBank.length >= numberOfTaps) {
      this.handleEnd(event);
    }
  };

  render() {
    const { children, maxDurationMs, style } = this.props;

    return (
      <TouchableWithoutFeedback
        style={style}
        onPressIn={this.handlePressIn}
        onPressOut={this.handlePressOut}
        delayLongPress={maxDurationMs}>
        {children}
      </TouchableWithoutFeedback>
    );
  }
}

const FlingGestureHandler = createStubHandler('FlingGestureHandler');

const ForceTouchGestureHandler = createStubHandler('ForceTouchGestureHandler');

const LongPressGestureHandler = createStubHandler('LongPressGestureHandler');

const PanGestureHandler = createStubHandler('PanGestureHandler');

const PinchGestureHandler = createStubHandler('PinchGestureHandler');

const RotationGestureHandler = createStubHandler('RotationGestureHandler');

// Factory for stub Button component
// (at the moment this is a plain TouchableWithoutFeedback)
function createStubButton(name) {
  return class Button extends React.Component {
    static displayName = name;

    render() {
      return (
        <TouchableWithoutFeedback accessibilityRole="button" {...this.props} />
      );
    }
  };
}

const RawButton = createStubButton('RawButton');
const BaseButton = createStubButton('BaseButton');
const RectButton = createStubButton('RectButton');
const BorderlessButton = createStubButton('BorderlessButton');

// Export same components as in GestureHandler.js
export {
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
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
