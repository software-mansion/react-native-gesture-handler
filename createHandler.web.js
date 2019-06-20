import Hammer from 'hammerjs';
import React from 'react';
import { findNodeHandle, TouchableWithoutFeedback, View } from 'react-native';

import Directions from './Directions';
import State from './State';

function logDirection(d) {
  const maap = {
    [Hammer.DIRECTION_ALL]: 'ALL',
    [Hammer.DIRECTION_DOWN]: 'DOWN',
    [Hammer.DIRECTION_HORIZONTAL]: 'HORIZONTAL',
    [Hammer.DIRECTION_LEFT]: 'LEFT',
    [Hammer.DIRECTION_NONE]: 'NONE',
    [Hammer.DIRECTION_RIGHT]: 'RIGHT',
    [Hammer.DIRECTION_UP]: 'UP',
    [Hammer.DIRECTION_VERTICAL]: 'VERTICAL',
  };
  console.log(maap[d]);
}

function invokeNullableMethod(name, method, event) {
  if (method) {
    if (typeof method === 'function') {
      method(event);
    } else {
      if (
        '__getHandler' in method &&
        typeof method.__getHandler === 'function'
      ) {
        const handler = method.__getHandler();
        invokeNullableMethod(name, handler, event);
      } else {
        if ('__nodeConfig' in method) {
          const { argMapping } = method.__nodeConfig;
          if (Array.isArray(argMapping)) {
            for (const index in argMapping) {
              const [key] = argMapping[index];
              if (key in event.nativeEvent) {
                method.__nodeConfig.argMapping[index] = [
                  key,
                  event.nativeEvent[key],
                ];
              }
            }
          }
        }
      }
    }
  }
}

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

function ensureConfig(config) {
  const props = { ...config };
  if ('activeOffsetX' in config) {
    props.activeOffsetX = getRangeValue(config.activeOffsetX);
  }
  if ('activeOffsetY' in config) {
    props.activeOffsetY = getRangeValue(config.activeOffsetY);
  }
  if ('failOffsetY' in config) {
    props.failOffsetY = getRangeValue(config.failOffsetY);
  } else {
    props.failOffsetY = getRangeValue(Infinity);
  }
  if ('failOffsetX' in config) {
    props.failOffsetX = getRangeValue(config.failOffsetX);
  } else {
    props.failOffsetX = getRangeValue(Infinity);
  }

  if (!('minPointers' in config)) {
    props.minPointers = 1;
  }

  props.maxPointers = Math.max(
    config.minPointers || 0,
    config.maxPointers || 0
  );

  if (config.minPointers <= 0) {
    throw new Error('minPointers must be larger than 0');
  }

  return props;
}

function getRangeValue(value) {
  if (Array.isArray(value)) {
    if (!value.length || value.length > 2) {
      throw new Error('Range value must only contain 2 values');
    } else if (value.length === 1) {
      return getRangeValue(value[0]);
    }
    return value;
  } else {
    return value < 0 ? [value, Infinity] : [-Infinity, value];
  }
}

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

const valueInRange = (value, range) => value >= range[0] && value <= range[1];

const valueOutOfRange = (value, range) =>
  value <= range[0] || value >= range[1];

function validateCriteria(
  { recognizer, pointerLength, velocity, vx, vy, dx, dy, ...inputData },
  {
    minPointers,
    maxPointers,
    minVelocity,
    minVelocityX,
    minVelocityY,
    failOffsetX,
    failOffsetY,
    activeOffsetX,
    activeOffsetY,
  }
) {
  const validPointerCount =
    pointerLength >= minPointers && pointerLength <= maxPointers;

  let isFastEnough = Math.abs(velocity) >= minVelocity;

  if (
    isFastEnough &&
    typeof minVelocityX !== 'undefined' &&
    Math.abs(vx) < minVelocityX
  ) {
    isFastEnough = false;
  }
  if (
    isFastEnough &&
    typeof minVelocityY !== 'undefined' &&
    Math.abs(vy) < minVelocityY
  ) {
    isFastEnough = false;
  }

  let isWithinBounds =
    valueInRange(dx, failOffsetX) && valueInRange(dy, failOffsetY);

  let isLongEnough = true;

  if (isLongEnough && activeOffsetX) {
    isLongEnough = valueOutOfRange(dx, activeOffsetX);
  }
  if (isLongEnough && activeOffsetY) {
    isLongEnough = valueOutOfRange(dy, activeOffsetY);
  }

  return {
    success:
      validPointerCount && isFastEnough && isWithinBounds && isLongEnough,
    failed: !isWithinBounds,
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

function panDirectionForConfig({ activeOffsetX, activeOffsetY }) {
  let directions = [];
  let horizontalDirections = [];
  if (activeOffsetX) {
    if (Math.abs(activeOffsetX[0]) !== Infinity)
      horizontalDirections.push(Hammer.DIRECTION_LEFT);
    if (Math.abs(activeOffsetX[1]) !== Infinity)
      horizontalDirections.push(Hammer.DIRECTION_RIGHT);
    if (horizontalDirections.length === 2)
      horizontalDirections = [Hammer.DIRECTION_HORIZONTAL];
    directions = directions.concat(horizontalDirections);
  }
  let verticalDirections = [];
  if (activeOffsetY) {
    if (Math.abs(activeOffsetY[0]) !== Infinity)
      verticalDirections.push(Hammer.DIRECTION_UP);
    if (Math.abs(activeOffsetY[1]) !== Infinity)
      verticalDirections.push(Hammer.DIRECTION_DOWN);
    if (verticalDirections.length === 2)
      verticalDirections = [Hammer.DIRECTION_VERTICAL];
    directions = directions.concat(verticalDirections);
  }

  if (!directions.length) {
    return Hammer.DIRECTION_NONE;
  }
  if (
    directions[0] === Hammer.DIRECTION_HORIZONTAL &&
    directions[1] === Hammer.DIRECTION_VERTICAL
  ) {
    return Hammer.DIRECTION_ALL;
  }
  if (horizontalDirections.length && verticalDirections.length) {
    return Hammer.DIRECTION_ALL;
  }

  return directions[0];
}

const DEG_RAD = Math.PI / 180;

function createGestureHandler(input) {
  return class extends React.Component {
    static defaultProps = { enabled: true, ...input.props };

    constructor(props) {
      super(props);
      this.config = ensureConfig(props);
    }

    componentDidUpdate() {
      if (this.hammer) {
        this.sync();
      }
      this.config = ensureConfig(this.props);
    }

    componentWillUnmount() {
      if (this.hammer) {
        this.hammer.stop();
        this.hammer.destroy();
      }
      this.hammer = null;
    }

    isGestureRunning = false;
    hasGestureFailed = false;

    setRef = ref => {
      this.ref = ref;
      this.view = findNodeHandle(ref);
      this.hammer = new Hammer(this.view, {
        // touchAction: 'pan-right'
      });
      input.start({ manager: this.hammer, props: this.props });

      let oldState = State.UNDETERMINED;
      let previousState = State.UNDETERMINED;
      let initialRotation = 0;

      this.hammer.on('hammer.input', ({ isFirst, isFinal }) => {
        if (isFirst) {
          this.hasGestureFailed = false;
        }
        if (isFinal) {
          // in favor of a willFail otherwise the last frame of the gesture will be captured.
          setTimeout(() => {
            this.hasGestureFailed = false;
          });
        }
      });
      this.hammer.on(`${input.name}start`, ({ deltaX, deltaY }) => {
        this.isGestureRunning = true;
        this.__initialX = deltaX;
        this.__initialY = deltaY;
      });
      this.hammer.on(`${input.name}end ${input.name}cancel`, () => {
        this.isGestureRunning = false;
      });

      this.hammer.on(input.name, ev => {
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
          maxPointers: numberOfPointers,
        } = ev;

        let deltaRotation = 0;
        if (ev.type === 'rotate') {
          if (ev.isFirst) {
            initialRotation = rotation;
          }
          deltaRotation = (rotation - initialRotation) * DEG_RAD;
        }

        const state = EventMap[eventType];
        const direction = DirectionMap[ev.direction];
        if (state !== previousState) {
          oldState = previousState;
          previousState = state;
        }
        const nativeEvent = {
          direction,
          oldState,
          translationX: deltaX - (this.__initialX || 0),
          translationY: deltaY - (this.__initialY || 0),
          velocityX,
          velocityY,
          velocity,
          rotation: deltaRotation,
          scale,

          x: center.x,
          y: center.y,
          absoluteX: center.x,
          absoluteY: center.y,
          focalX: center.x,
          focalY: center.y,
          anchorX: center.x,
          anchorY: center.y,
        };

        const timeStamp = Date.now();
        const event = {
          nativeEvent: {
            numberOfPointers,
            state,
            ...input.filter(nativeEvent),

            // onHandlerStateChange only
            handlerTag: null,
            target: null,
            oldState,
          },
          timeStamp,
        };

        if (ev.isFinal) {
          oldState = State.UNDETERMINED;
          previousState = State.UNDETERMINED;
        }

        invokeNullableMethod('onGestureEvent', onGestureEvent, event);
        invokeNullableMethod(
          'onHandlerStateChange',
          onHandlerStateChange,
          event
        );
      });
      this.sync();
    };

    sync = () => {
      const gesture = this.hammer.get(input.name);

      // Clear all
      for (const recognizer of Object.values(gesture.simultaneous)) {
        gesture.dropRecognizeWith(recognizer);
      }

      for (const recognizer of Object.values(gesture.requireFail)) {
        gesture.dropRequireFailure(recognizer);
      }

      gesture.set({
        direction:
          input.name === 'pan' ? panDirectionForConfig(this.config) : undefined,
        pointers: this.props.minPointers,
        enable: (recognizer, inputData) => {
          if (!this.props.enabled) {
            this.isGestureRunning = false;
            this.hasGestureFailed = false;
            return false;
          }
          if (this.hasGestureFailed) {
            return false;
          }
          if (this.isGestureRunning) {
            return true;
          }
          if (!inputData || !recognizer.options) {
            return true;
          }
          if (input.enabled) {
            const { success, failed } = input.enabled(
              this.config,
              recognizer,
              inputData
            );
            if (failed) {
              this.hasGestureFailed = true;
            }
            return success;
          }
          return true;
        },
      });

      if (this.props.simultaneousHandlers) {
        const handlers = asArray(this.props.simultaneousHandlers)
          .filter(ref => ref.hammer)
          .map(({ hammer }) => hammer);
        gesture.recognizeWith(handlers);
      }

      if (this.props.waitFor) {
        const handlers = asArray(this.props.waitFor)
          .filter(ref => ref.hammer)
          .map(({ hammer }) => hammer);
        gesture.requireFailure(handlers);
      }
    };

    setNativeProps = (...props) => {
      this.ref.setNativeProps(...props);
    };

    render() {
      const { children, style } = this.props;
      return (
        <View style={[{ flex: 1 }, style]} ref={this.setRef}>
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
  PanGestureHandler: createGestureHandler({
    name: 'pan',
    start({ manager, props }) {
      manager.add(
        new Hammer.Pan({
          pointers: props.minPointers,
        })
      );
    },
    enabled(props, recognizer, inputData) {
      return validateCriteria(
        {
          ...inputData,
          recognizer,
          pointerLength: inputData.maxPointers,
          velocity: inputData.overallVelocity,
          vx: inputData.velocityX,
          vy: inputData.velocityY,
          dx: inputData.deltaX,
          dy: inputData.deltaY,
        },
        props
      );
    },
    filter({
      translationX,
      translationY,
      velocityX,
      velocityY,
      x,
      y,
      absoluteX,
      absoluteY,
    }) {
      return {
        translationX,
        translationY,
        velocityX,
        velocityY,
        x,
        y,
        absoluteX,
        absoluteY,
      };
    },
    props: {
      // activeOffsetY: rangeFromNumber(0),
      // activeOffsetX: rangeFromNumber(0),
      // failOffsetY: rangeFromNumber(Infinity),
      // failOffsetX: rangeFromNumber(Infinity),
      minVelocity: 0,
      minVelocityX: 0,
      minVelocityY: 0,
      minDist: 10,
      minPointers: 1,
      maxPointers: 1,
    },
  }),
  RotationGestureHandler: createGestureHandler({
    name: 'rotate',
    start({ manager, props }) {
      manager.add(new Hammer.Rotate({ pointers: props.minPointers }));
    },
    filter({ anchorX, anchorY, velocity, rotation }) {
      return {
        anchorX,
        anchorY,
        velocity,
        rotation,
      };
    },
    props: {
      minPointers: 2,
      maxPointers: 2,
    },
  }),
  PinchGestureHandler: createGestureHandler({
    name: 'pinch',
    start({ manager, props }) {
      manager.add(new Hammer.Pinch({ pointers: props.minPointers }));
    },
    filter({ scale, velocity, focalX, focalY }) {
      return {
        scale,
        velocity,
        focalX,
        focalY,
      };
    },
    props: {
      minPointers: 2,
      maxPointers: 2,
    },
  }),
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
