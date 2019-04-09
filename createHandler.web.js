import Hammer from 'hammerjs';
import React from 'react';
import { findNodeHandle, TouchableWithoutFeedback, View } from 'react-native';

import Directions from './Directions';
import State from './State';

// Map Hammer values to RNGH
const EventMap = {
  [Hammer.INPUT_START]: State.BEGAN,
  [Hammer.INPUT_MOVE]: State.ACTIVE,
  [Hammer.INPUT_END]: State.END,
  [Hammer.INPUT_CANCEL]: State.FAILED,
};

const DirectionMap = {
  [Hammer.DIRECTION_RIGHT]: Directions.RIGHT,
  [Hammer.DIRECTION_LEFT]: Directions.LEFT,
  [Hammer.DIRECTION_UP]: Directions.UP,
  [Hammer.DIRECTION_DOWN]: Directions.DOWN,
};

function handleHandlerStateChange(props, event, oldState, state) {
  const { enabled, onHandlerStateChange } = props;

  if (enabled !== false && onHandlerStateChange) {
    const {
      nativeEvent: {
        locationX: x,
        locationY: y,
        pageX: absoluteX,
        pageY: absoluteY,
      },
    } = event;

    onHandlerStateChange({
      nativeEvent: {
        oldState,
        state,
        x,
        y,
        absoluteX,
        absoluteY,
        pointerInside: true,
      },
    });
  }
}

function handleFailed(props, event) {
  handleHandlerStateChange(props, event, State.ACTIVE, State.FAILED);
}

function handleEnd(props, event) {
  handleHandlerStateChange(props, event, State.ACTIVE, State.END);
}

function handleActivate(props, event) {
  handleHandlerStateChange(props, event, State.BEGAN, State.ACTIVE);
}

function handleBegan(props, event) {
  handleHandlerStateChange(props, event, State.UNDETERMINED, State.BEGAN);
}

function mapPropsToOptions(props) {
  let options = {};
  if ('minDist' in props) {
    options.threshold = props.minDist;
  }
  if ('enabled' in props) {
    options.enabled = props.enabled;
  }
  return options;
}

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

function createGestureHandler(hammerClass, hammerGestureName) {
  return class extends React.Component {
    componentDidUpdate() {
      if (this.hammer) {
        this.sync();
      }
    }

    componentWillUnmount() {
      if (this.hammer) {
        this.hammer.stop();
        this.hammer.destroy();
      }
      this.hammer = null;
    }

    setRef = ref => {
      this.view = findNodeHandle(ref);
      this.hammer = new Hammer(this.view, {
        recognizers: [[hammerClass]],
      });

      let oldState = State.UNDETERMINED;
      let previousState = State.UNDETERMINED;
      this.hammer.on('hammer.input', ev => {
        const { onHandlerStateChange, onGestureEvent } = this.props;

        const {
          eventType,
          deltaX,
          deltaY,
          velocityX,
          velocityY,
          velocity,
          center,
          rotation,
          scale,
        } = ev;

        const state = EventMap[eventType];
        const direction = DirectionMap[ev.direction];
        if (state !== previousState) {
          oldState = previousState;
          previousState = state;
        }
        const nativeEvent = {
          state,
          direction,
          oldState,
          translationX: deltaX,
          translationY: deltaY,
          velocityX,
          velocityY,
          x: center.x,
          y: center.y,
          absoluteX: center.x,
          absoluteY: center.y,
          velocity,
          rotation: rotation * 0.2,
          scale,
          // focalX
          // focalY
        };

        const event = {
          nativeEvent,
          timeStamp: Date.now(),
        };

        if (ev.isFinal) {
          oldState = State.UNDETERMINED;
          previousState = State.UNDETERMINED;
        }
        if (onGestureEvent) {
          onGestureEvent(event);
        }
        if (onHandlerStateChange) {
          onHandlerStateChange(event);
        }
      });
      this.sync();
    };

    sync = () => {
      const { hammer, props } = this;

      const gesture = hammer.get(hammerGestureName);
      gesture.set(mapPropsToOptions(props));

      if (props.simultaneousHandlers) {
        const handlers = asArray(props.simultaneousHandlers);
        hammer.get(hammerGestureName).recognizeWith(handlers);
      }

      if (props.waitFor) {
        const handlers = asArray(props.waitFor);
        hammer.get(hammerGestureName).requireFailure(handlers);
      }
    };

    render() {
      const { children, style } = this.props;
      return (
        <View style={style} ref={this.setRef}>
          {children}
        </View>
      );
    }
  };
}

class UnimplementedGestureHandler extends React.Component {
  setNativeProps = () => {
    // Do nothing
  };

  render() {
    return this.props.children;
  }
}

const handlers = {
  NativeViewGestureHandler: class NativeViewGestureHandler extends React.Component {
    render() {
      const { children } = this.props;

      return children;
    }
  },
  PanGestureHandler: createGestureHandler(Hammer.Pan, 'pan'),
  RotationGestureHandler: createGestureHandler(Hammer.Rotate, 'rotate'),
  PinchGestureHandler: createGestureHandler(Hammer.Pinch, 'pinch'),
  TapGestureHandler: class TapGestureHandler extends React.Component {
    static defaultProps = {
      numberOfTaps: 1,
      maxDurationMs: 500,
      maxDelayMs: 500,
      minPointers: 1,
      maxDeltaX: Number.MAX_SAFE_INTEGER,
      maxDeltaY: Number.MAX_SAFE_INTEGER,
      maxDist: Number.MAX_SAFE_INTEGER,
    };

    hasBegun = false;
    touchBank = [];
    timeout = null;

    setNativeProps() {}

    clearState = () => {
      this.hasBegun = false;
      this.touchBank = [];
      window.clearTimeout(this.timeout);
    };

    handlePressIn = event => {
      const { maxDelayMs } = this.props;

      if (!this.hasBegun) {
        event.persist();
        this.hasBegun = true;
        handleBegan(this.props, event);

        // Cancel if not finished in time
        this.timeout = window.setTimeout(() => {
          if (this.hasBegun) {
            this.clearState();
            handleFailed(this.props, event);
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
        this.clearState();
        handleFailed(this.props, event);
      } else if (this.touchBank.length >= numberOfTaps) {
        handleActivate(this.props, event);
        this.clearState();
        handleEnd(this.props, event);
      }
    };

    render() {
      const { children, style } = this.props;

      return (
        <TouchableWithoutFeedback
          style={style}
          onPressIn={this.handlePressIn}
          onPressOut={this.handlePressOut}>
          {children}
        </TouchableWithoutFeedback>
      );
    }
  },
};

export default function createHandler(handlerName, propTypes = {}) {
  class Handler extends React.Component {
    static displayName = handlerName;

    static propTypes = propTypes;

    _refHandler = node => {
      this._viewNode = node;
    };

    setNativeProps = (...args) => {
      this._viewNode.setNativeProps(...args);
    };

    render() {
      let Handler = handlers[handlerName];
      if (!Handler) {
        console.warn(`${handlerName} is not yet supported on web.`);
        Handler = UnimplementedGestureHandler;
      }

      return <Handler ref={this._refHandler} {...this.props} />;
    }
  }
  return Handler;
}
