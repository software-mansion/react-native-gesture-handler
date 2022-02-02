"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _PanGestureHandler = require("../handlers/PanGestureHandler");

var _TapGestureHandler = require("../handlers/TapGestureHandler");

var _State = require("../State");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DRAG_TOSS = 0.05;

class Swipeable extends React.Component {
  constructor(_props) {
    super(_props);

    _defineProperty(this, "onGestureEvent", void 0);

    _defineProperty(this, "transX", void 0);

    _defineProperty(this, "showLeftAction", void 0);

    _defineProperty(this, "leftActionTranslate", void 0);

    _defineProperty(this, "showRightAction", void 0);

    _defineProperty(this, "rightActionTranslate", void 0);

    _defineProperty(this, "updateAnimatedEvent", (props, state) => {
      const {
        friction,
        overshootFriction
      } = props;
      const {
        dragX,
        rowTranslation,
        leftWidth = 0,
        rowWidth = 0
      } = state;
      const {
        rightOffset = rowWidth
      } = state;
      const rightWidth = Math.max(0, rowWidth - rightOffset);
      const {
        overshootLeft = leftWidth > 0,
        overshootRight = rightWidth > 0
      } = props;

      const transX = _reactNative.Animated.add(rowTranslation, dragX.interpolate({
        inputRange: [0, friction],
        outputRange: [0, 1]
      })).interpolate({
        inputRange: [-rightWidth - 1, -rightWidth, leftWidth, leftWidth + 1],
        outputRange: [-rightWidth - (overshootRight ? 1 / overshootFriction : 0), -rightWidth, leftWidth, leftWidth + (overshootLeft ? 1 / overshootFriction : 0)]
      });

      this.transX = transX;
      this.showLeftAction = leftWidth > 0 ? transX.interpolate({
        inputRange: [-1, 0, leftWidth],
        outputRange: [0, 0, 1]
      }) : new _reactNative.Animated.Value(0);
      this.leftActionTranslate = this.showLeftAction.interpolate({
        inputRange: [0, Number.MIN_VALUE],
        outputRange: [-10000, 0],
        extrapolate: 'clamp'
      });
      this.showRightAction = rightWidth > 0 ? transX.interpolate({
        inputRange: [-rightWidth, 0, 1],
        outputRange: [1, 0, 0]
      }) : new _reactNative.Animated.Value(0);
      this.rightActionTranslate = this.showRightAction.interpolate({
        inputRange: [0, Number.MIN_VALUE],
        outputRange: [-10000, 0],
        extrapolate: 'clamp'
      });
    });

    _defineProperty(this, "onTapHandlerStateChange", ({
      nativeEvent
    }) => {
      if (nativeEvent.oldState === _State.State.ACTIVE) {
        this.close();
      }
    });

    _defineProperty(this, "onHandlerStateChange", ev => {
      if (ev.nativeEvent.oldState === _State.State.ACTIVE) {
        this.handleRelease(ev);
      }
    });

    _defineProperty(this, "handleRelease", ev => {
      const {
        velocityX,
        translationX: dragX
      } = ev.nativeEvent;
      const {
        leftWidth = 0,
        rowWidth = 0,
        rowState
      } = this.state;
      const {
        rightOffset = rowWidth
      } = this.state;
      const rightWidth = rowWidth - rightOffset;
      const {
        friction,
        leftThreshold = leftWidth / 2,
        rightThreshold = rightWidth / 2
      } = this.props;
      const startOffsetX = this.currentOffset() + dragX / friction;
      const translationX = (dragX + DRAG_TOSS * velocityX) / friction;
      let toValue = 0;

      if (rowState === 0) {
        if (translationX > leftThreshold) {
          toValue = leftWidth;
        } else if (translationX < -rightThreshold) {
          toValue = -rightWidth;
        }
      } else if (rowState === 1) {
        // swiped to left
        if (translationX > -leftThreshold) {
          toValue = leftWidth;
        }
      } else {
        // swiped to right
        if (translationX < rightThreshold) {
          toValue = -rightWidth;
        }
      }

      this.animateRow(startOffsetX, toValue, velocityX / friction);
    });

    _defineProperty(this, "animateRow", (fromValue, toValue, velocityX) => {
      const {
        dragX,
        rowTranslation
      } = this.state;
      dragX.setValue(0);
      rowTranslation.setValue(fromValue);
      this.setState({
        rowState: Math.sign(toValue)
      });

      _reactNative.Animated.spring(rowTranslation, {
        restSpeedThreshold: 1.7,
        restDisplacementThreshold: 0.4,
        velocity: velocityX,
        bounciness: 0,
        toValue,
        useNativeDriver: this.props.useNativeAnimations,
        ...this.props.animationOptions
      }).start(({
        finished
      }) => {
        if (finished) {
          if (toValue > 0 && this.props.onSwipeableLeftOpen) {
            this.props.onSwipeableLeftOpen();
          } else if (toValue < 0 && this.props.onSwipeableRightOpen) {
            this.props.onSwipeableRightOpen();
          }

          if (toValue === 0) {
            var _this$props$onSwipeab, _this$props;

            (_this$props$onSwipeab = (_this$props = this.props).onSwipeableClose) === null || _this$props$onSwipeab === void 0 ? void 0 : _this$props$onSwipeab.call(_this$props);
          } else {
            var _this$props$onSwipeab2, _this$props2;

            (_this$props$onSwipeab2 = (_this$props2 = this.props).onSwipeableOpen) === null || _this$props$onSwipeab2 === void 0 ? void 0 : _this$props$onSwipeab2.call(_this$props2);
          }
        }
      });

      if (toValue > 0 && this.props.onSwipeableLeftWillOpen) {
        this.props.onSwipeableLeftWillOpen();
      } else if (toValue < 0 && this.props.onSwipeableRightWillOpen) {
        this.props.onSwipeableRightWillOpen();
      }

      if (toValue === 0) {
        var _this$props$onSwipeab3, _this$props3;

        (_this$props$onSwipeab3 = (_this$props3 = this.props).onSwipeableWillClose) === null || _this$props$onSwipeab3 === void 0 ? void 0 : _this$props$onSwipeab3.call(_this$props3);
      } else {
        var _this$props$onSwipeab4, _this$props4;

        (_this$props$onSwipeab4 = (_this$props4 = this.props).onSwipeableWillOpen) === null || _this$props$onSwipeab4 === void 0 ? void 0 : _this$props$onSwipeab4.call(_this$props4);
      }
    });

    _defineProperty(this, "onRowLayout", ({
      nativeEvent
    }) => {
      this.setState({
        rowWidth: nativeEvent.layout.width
      });
    });

    _defineProperty(this, "currentOffset", () => {
      const {
        leftWidth = 0,
        rowWidth = 0,
        rowState
      } = this.state;
      const {
        rightOffset = rowWidth
      } = this.state;
      const rightWidth = rowWidth - rightOffset;

      if (rowState === 1) {
        return leftWidth;
      } else if (rowState === -1) {
        return -rightWidth;
      }

      return 0;
    });

    _defineProperty(this, "close", () => {
      this.animateRow(this.currentOffset(), 0);
    });

    _defineProperty(this, "openLeft", () => {
      const {
        leftWidth = 0
      } = this.state;
      this.animateRow(this.currentOffset(), leftWidth);
    });

    _defineProperty(this, "openRight", () => {
      const {
        rowWidth = 0
      } = this.state;
      const {
        rightOffset = rowWidth
      } = this.state;
      const rightWidth = rowWidth - rightOffset;
      this.animateRow(this.currentOffset(), -rightWidth);
    });

    const _dragX = new _reactNative.Animated.Value(0);

    this.state = {
      dragX: _dragX,
      rowTranslation: new _reactNative.Animated.Value(0),
      rowState: 0,
      leftWidth: undefined,
      rightOffset: undefined,
      rowWidth: undefined
    };
    this.updateAnimatedEvent(_props, this.state);
    this.onGestureEvent = _reactNative.Animated.event([{
      nativeEvent: {
        translationX: _dragX
      }
    }], {
      useNativeDriver: _props.useNativeAnimations
    });
  }

  UNSAFE_componentWillUpdate(props, state) {
    if (this.props.friction !== props.friction || this.props.overshootLeft !== props.overshootLeft || this.props.overshootRight !== props.overshootRight || this.props.overshootFriction !== props.overshootFriction || this.state.leftWidth !== state.leftWidth || this.state.rightOffset !== state.rightOffset || this.state.rowWidth !== state.rowWidth) {
      this.updateAnimatedEvent(props, state);
    }
  }

  render() {
    const {
      rowState
    } = this.state;
    const {
      children,
      renderLeftActions,
      renderRightActions
    } = this.props;
    const left = renderLeftActions && /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
      style: [styles.leftActions, // all those and below parameters can have ! since they are all
      // asigned in constructor in `updateAnimatedEvent` but TS cannot spot
      // it for some reason
      {
        transform: [{
          translateX: this.leftActionTranslate
        }]
      }]
    }, renderLeftActions(this.showLeftAction, this.transX), /*#__PURE__*/React.createElement(_reactNative.View, {
      onLayout: ({
        nativeEvent
      }) => this.setState({
        leftWidth: nativeEvent.layout.x
      })
    }));
    const right = renderRightActions && /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
      style: [styles.rightActions, {
        transform: [{
          translateX: this.rightActionTranslate
        }]
      }]
    }, renderRightActions(this.showRightAction, this.transX), /*#__PURE__*/React.createElement(_reactNative.View, {
      onLayout: ({
        nativeEvent
      }) => this.setState({
        rightOffset: nativeEvent.layout.x
      })
    }));
    return /*#__PURE__*/React.createElement(_PanGestureHandler.PanGestureHandler, _extends({
      activeOffsetX: [-10, 10]
    }, this.props, {
      onGestureEvent: this.onGestureEvent,
      onHandlerStateChange: this.onHandlerStateChange
    }), /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
      onLayout: this.onRowLayout,
      style: [styles.container, this.props.containerStyle]
    }, left, right, /*#__PURE__*/React.createElement(_TapGestureHandler.TapGestureHandler, {
      enabled: rowState !== 0,
      onHandlerStateChange: this.onTapHandlerStateChange
    }, /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
      pointerEvents: rowState === 0 ? 'auto' : 'box-only',
      style: [{
        transform: [{
          translateX: this.transX
        }]
      }, this.props.childrenContainerStyle]
    }, children))));
  }

}

exports.default = Swipeable;

_defineProperty(Swipeable, "defaultProps", {
  friction: 1,
  overshootFriction: 1,
  useNativeAnimations: true
});

const styles = _reactNative.StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  leftActions: { ..._reactNative.StyleSheet.absoluteFillObject,
    flexDirection: _reactNative.I18nManager.isRTL ? 'row-reverse' : 'row'
  },
  rightActions: { ..._reactNative.StyleSheet.absoluteFillObject,
    flexDirection: _reactNative.I18nManager.isRTL ? 'row' : 'row-reverse'
  }
});
//# sourceMappingURL=Swipeable.js.map