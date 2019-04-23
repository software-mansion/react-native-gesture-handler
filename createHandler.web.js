import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';

import State from './State';

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

    componentDidMount() {
      if (!handlers[handlerName]) {
        console.warn(`${handlerName} is not yet supported on web.`);
      }
    }

    _refHandler = node => {
      this._viewNode = node;
    };

    setNativeProps = (...args) => {
      this._viewNode.setNativeProps(...args);
    };

    render() {
      const Handler = handlers[handlerName] || UnimplementedGestureHandler;

      return <Handler ref={this._refHandler} {...this.props} />;
    }
  }
  return Handler;
}
