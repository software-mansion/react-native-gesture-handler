import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import State from './State';

class BaseGestureHandler extends React.Component {
  clearState = () => {};

  handleHandlerStateChange(event, oldState, state) {
    const { enabled, onHandlerStateChange } = this.props;

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

  handleFailed = event => {
    this.clearState();
    this.handleHandlerStateChange(event, State.ACTIVE, State.FAILED);
  };

  handleEnd = event => {
    this.clearState();
    this.handleHandlerStateChange(event, State.ACTIVE, State.END);
  };

  handleActivate = event => {
    this.handleHandlerStateChange(event, State.BEGAN, State.ACTIVE);
  };

  handleBegan = event => {
    this.handleHandlerStateChange(event, State.UNDETERMINED, State.BEGAN);
  };
}

class UnimplementedGestureHandler extends BaseGestureHandler {
  render() {
    return this.props.children;
  }
}

const handlers = {
  NativeViewGestureHandler: class NativeViewGestureHandler extends BaseGestureHandler {
    render() {
      const { children } = this.props;

      return children;
    }
  },

  TapGestureHandler: class TapGestureHandler extends BaseGestureHandler {
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
        this.handleBegan(event);

        // Cancel if not finished in time
        this.timeout = window.setTimeout(() => {
          if (this.hasBegun) {
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
        this.handleActivate(event);
        this.handleEnd(event);
      }
    };

    render() {
      const { children, style } = this.props;

      return (
        <TouchableWithoutFeedback
          style={style}
          onPressIn={this.handlePressIn}
          onPressOut={this.handlePressOut}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      );
    }
  },
};

export default {
  createGestureHandler: () => {},
  attachGestureHandler: () => {},
  updateGestureHandler: () => {},
  dropGestureHandler: () => {},
  getChildren: function() {
    return this.props.children;
  },
  render: function render() {
    const handlerName = this._handlerName;
    const Handler = handlers[handlerName] || UnimplementedGestureHandler;

    return <Handler {...this.props} />;
  },
};
