"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _invariant = _interopRequireDefault(require("invariant"));

var _reactNative = require("react-native");

var _PanGestureHandler = require("../handlers/PanGestureHandler");

var _TapGestureHandler = require("../handlers/TapGestureHandler");

var _State = require("../State");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DRAG_TOSS = 0.05;
const IDLE = 'Idle';
const DRAGGING = 'Dragging';
const SETTLING = 'Settling';

class DrawerLayout extends React.Component {
  constructor(_props) {
    super(_props);

    _defineProperty(this, "openValue", void 0);

    _defineProperty(this, "onGestureEvent", void 0);

    _defineProperty(this, "accessibilityIsModalView", /*#__PURE__*/React.createRef());

    _defineProperty(this, "pointerEventsView", /*#__PURE__*/React.createRef());

    _defineProperty(this, "panGestureHandler", /*#__PURE__*/React.createRef());

    _defineProperty(this, "drawerShown", false);

    _defineProperty(this, "updateAnimatedEvent", (props, state) => {
      // Event definition is based on
      const {
        drawerPosition,
        drawerWidth,
        drawerType
      } = props;
      const {
        dragX: dragXValue,
        touchX: touchXValue,
        drawerTranslation,
        containerWidth
      } = state;
      let dragX = dragXValue;
      let touchX = touchXValue;

      if (drawerPosition !== 'left') {
        // Most of the code is written in a way to handle left-side drawer. In
        // order to handle right-side drawer the only thing we need to do is to
        // reverse events coming from gesture handler in a way they emulate
        // left-side drawer gestures. E.g. dragX is simply -dragX, and touchX is
        // calulcated by subtracing real touchX from the width of the container
        // (such that when touch happens at the right edge the value is simply 0)
        dragX = _reactNative.Animated.multiply(new _reactNative.Animated.Value(-1), dragXValue); // TODO(TS): (for all "as" in this file) make sure we can map this

        touchX = _reactNative.Animated.add(new _reactNative.Animated.Value(containerWidth), _reactNative.Animated.multiply(new _reactNative.Animated.Value(-1), touchXValue)); // TODO(TS): make sure we can map this;

        touchXValue.setValue(containerWidth);
      } else {
        touchXValue.setValue(0);
      } // While closing the drawer when user starts gesture outside of its area (in greyed
      // out part of the window), we want the drawer to follow only once finger reaches the
      // edge of the drawer.
      // E.g. on the diagram below drawer is illustrate by X signs and the greyed out area by
      // dots. The touch gesture starts at '*' and moves left, touch path is indicated by
      // an arrow pointing left
      // 1) +---------------+ 2) +---------------+ 3) +---------------+ 4) +---------------+
      //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
      //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
      //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
      //    |XXXXXXXX|......|    |XXXXXXXX|.<-*..|    |XXXXXXXX|<--*..|    |XXXXX|<-----*..|
      //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
      //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
      //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
      //    +---------------+    +---------------+    +---------------+    +---------------+
      //
      // For the above to work properly we define animated value that will keep
      // start position of the gesture. Then we use that value to calculate how
      // much we need to subtract from the dragX. If the gesture started on the
      // greyed out area we take the distance from the edge of the drawer to the
      // start position. Otherwise we don't subtract at all and the drawer be
      // pulled back as soon as you start the pan.
      //
      // This is used only when drawerType is "front"
      //


      let translationX = dragX;

      if (drawerType === 'front') {
        const startPositionX = _reactNative.Animated.add(touchX, _reactNative.Animated.multiply(new _reactNative.Animated.Value(-1), dragX));

        const dragOffsetFromOnStartPosition = startPositionX.interpolate({
          inputRange: [drawerWidth - 1, drawerWidth, drawerWidth + 1],
          outputRange: [0, 0, 1]
        });
        translationX = _reactNative.Animated.add(dragX, dragOffsetFromOnStartPosition); // TODO: as above
      }

      this.openValue = _reactNative.Animated.add(translationX, drawerTranslation).interpolate({
        inputRange: [0, drawerWidth],
        outputRange: [0, 1],
        extrapolate: 'clamp'
      });
      const gestureOptions = {
        useNativeDriver: props.useNativeAnimations
      };

      if (this.props.onDrawerSlide) {
        gestureOptions.listener = ev => {
          var _this$props$onDrawerS, _this$props;

          const translationX = Math.floor(Math.abs(ev.nativeEvent.translationX));
          const position = translationX / this.state.containerWidth;
          (_this$props$onDrawerS = (_this$props = this.props).onDrawerSlide) === null || _this$props$onDrawerS === void 0 ? void 0 : _this$props$onDrawerS.call(_this$props, position);
        };
      }

      this.onGestureEvent = _reactNative.Animated.event([{
        nativeEvent: {
          translationX: dragXValue,
          x: touchXValue
        }
      }], gestureOptions);
    });

    _defineProperty(this, "handleContainerLayout", ({
      nativeEvent
    }) => {
      this.setState({
        containerWidth: nativeEvent.layout.width
      });
    });

    _defineProperty(this, "emitStateChanged", (newState, drawerWillShow) => {
      var _this$props$onDrawerS2, _this$props2;

      (_this$props$onDrawerS2 = (_this$props2 = this.props).onDrawerStateChanged) === null || _this$props$onDrawerS2 === void 0 ? void 0 : _this$props$onDrawerS2.call(_this$props2, newState, drawerWillShow);
    });

    _defineProperty(this, "openingHandlerStateChange", ({
      nativeEvent
    }) => {
      if (nativeEvent.oldState === _State.State.ACTIVE) {
        this.handleRelease({
          nativeEvent
        });
      } else if (nativeEvent.state === _State.State.ACTIVE) {
        this.emitStateChanged(DRAGGING, false);

        if (this.props.keyboardDismissMode === 'on-drag') {
          _reactNative.Keyboard.dismiss();
        }

        if (this.props.hideStatusBar) {
          _reactNative.StatusBar.setHidden(true, this.props.statusBarAnimation || 'slide');
        }
      }
    });

    _defineProperty(this, "onTapHandlerStateChange", ({
      nativeEvent
    }) => {
      if (this.drawerShown && nativeEvent.oldState === _State.State.ACTIVE && this.props.drawerLockMode !== 'locked-open') {
        this.closeDrawer();
      }
    });

    _defineProperty(this, "handleRelease", ({
      nativeEvent
    }) => {
      const {
        drawerWidth,
        drawerPosition,
        drawerType
      } = this.props;
      const {
        containerWidth
      } = this.state;
      let {
        translationX: dragX,
        velocityX,
        x: touchX
      } = nativeEvent;

      if (drawerPosition !== 'left') {
        // See description in _updateAnimatedEvent about why events are flipped
        // for right-side drawer
        dragX = -dragX;
        touchX = containerWidth - touchX;
        velocityX = -velocityX;
      }

      const gestureStartX = touchX - dragX;
      let dragOffsetBasedOnStart = 0;

      if (drawerType === 'front') {
        dragOffsetBasedOnStart = gestureStartX > drawerWidth ? gestureStartX - drawerWidth : 0;
      }

      const startOffsetX = dragX + dragOffsetBasedOnStart + (this.drawerShown ? drawerWidth : 0);
      const projOffsetX = startOffsetX + DRAG_TOSS * velocityX;
      const shouldOpen = projOffsetX > drawerWidth / 2;

      if (shouldOpen) {
        this.animateDrawer(startOffsetX, drawerWidth, velocityX);
      } else {
        this.animateDrawer(startOffsetX, 0, velocityX);
      }
    });

    _defineProperty(this, "updateShowing", showing => {
      var _this$accessibilityIs, _this$pointerEventsVi, _this$panGestureHandl;

      this.drawerShown = showing;
      (_this$accessibilityIs = this.accessibilityIsModalView.current) === null || _this$accessibilityIs === void 0 ? void 0 : _this$accessibilityIs.setNativeProps({
        accessibilityViewIsModal: showing
      });
      (_this$pointerEventsVi = this.pointerEventsView.current) === null || _this$pointerEventsVi === void 0 ? void 0 : _this$pointerEventsVi.setNativeProps({
        pointerEvents: showing ? 'auto' : 'none'
      });
      const {
        drawerPosition,
        minSwipeDistance,
        edgeWidth
      } = this.props;
      const fromLeft = drawerPosition === 'left'; // gestureOrientation is 1 if the expected gesture is from left to right and
      // -1 otherwise e.g. when drawer is on the left and is closed we expect left
      // to right gesture, thus orientation will be 1.

      const gestureOrientation = (fromLeft ? 1 : -1) * (this.drawerShown ? -1 : 1); // When drawer is closed we want the hitSlop to be horizontally shorter than
      // the container size by the value of SLOP. This will make it only activate
      // when gesture happens not further than SLOP away from the edge

      const hitSlop = fromLeft ? {
        left: 0,
        width: showing ? undefined : edgeWidth
      } : {
        right: 0,
        width: showing ? undefined : edgeWidth
      }; // @ts-ignore internal API, maybe could be fixed in handler types

      (_this$panGestureHandl = this.panGestureHandler.current) === null || _this$panGestureHandl === void 0 ? void 0 : _this$panGestureHandl.setNativeProps({
        hitSlop,
        activeOffsetX: gestureOrientation * minSwipeDistance
      });
    });

    _defineProperty(this, "animateDrawer", (fromValue, toValue, velocity, speed) => {
      this.state.dragX.setValue(0);
      this.state.touchX.setValue(this.props.drawerPosition === 'left' ? 0 : this.state.containerWidth);

      if (fromValue != null) {
        let nextFramePosition = fromValue;

        if (this.props.useNativeAnimations) {
          // When using native driver, we predict the next position of the
          // animation because it takes one frame of a roundtrip to pass RELEASE
          // event from native driver to JS before we can start animating. Without
          // it, it is more noticable that the frame is dropped.
          if (fromValue < toValue && velocity > 0) {
            nextFramePosition = Math.min(fromValue + velocity / 60.0, toValue);
          } else if (fromValue > toValue && velocity < 0) {
            nextFramePosition = Math.max(fromValue + velocity / 60.0, toValue);
          }
        }

        this.state.drawerTranslation.setValue(nextFramePosition);
      }

      const willShow = toValue !== 0;
      this.updateShowing(willShow);
      this.emitStateChanged(SETTLING, willShow);

      if (this.props.hideStatusBar) {
        _reactNative.StatusBar.setHidden(willShow, this.props.statusBarAnimation || 'slide');
      }

      _reactNative.Animated.spring(this.state.drawerTranslation, {
        velocity,
        bounciness: 0,
        toValue,
        useNativeDriver: this.props.useNativeAnimations,
        speed: speed !== null && speed !== void 0 ? speed : undefined
      }).start(({
        finished
      }) => {
        if (finished) {
          this.emitStateChanged(IDLE, willShow);

          if (willShow) {
            var _this$props$onDrawerO, _this$props3;

            (_this$props$onDrawerO = (_this$props3 = this.props).onDrawerOpen) === null || _this$props$onDrawerO === void 0 ? void 0 : _this$props$onDrawerO.call(_this$props3);
          } else {
            var _this$props$onDrawerC, _this$props4;

            (_this$props$onDrawerC = (_this$props4 = this.props).onDrawerClose) === null || _this$props$onDrawerC === void 0 ? void 0 : _this$props$onDrawerC.call(_this$props4);
          }
        }
      });
    });

    _defineProperty(this, "openDrawer", (options = {}) => {
      this.animateDrawer( // TODO: decide if it should be null or undefined is the proper value
      undefined, this.props.drawerWidth, options.velocity ? options.velocity : 0); // We need to force the update, otherwise the overlay is not rerendered and
      // it would not be clickable

      this.forceUpdate();
    });

    _defineProperty(this, "closeDrawer", (options = {}) => {
      // TODO: decide if it should be null or undefined is the proper value
      this.animateDrawer(undefined, 0, options.velocity ? options.velocity : 0); // We need to force the update, otherwise the overlay is not rerendered and
      // it would be still clickable

      this.forceUpdate();
    });

    _defineProperty(this, "renderOverlay", () => {
      /* Overlay styles */
      (0, _invariant.default)(this.openValue, 'should be set');
      const overlayOpacity = this.openValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp'
      });
      const dynamicOverlayStyles = {
        opacity: overlayOpacity,
        backgroundColor: this.props.overlayColor
      };
      return /*#__PURE__*/React.createElement(_TapGestureHandler.TapGestureHandler, {
        onHandlerStateChange: this.onTapHandlerStateChange
      }, /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
        pointerEvents: this.drawerShown ? 'auto' : 'none',
        ref: this.pointerEventsView,
        style: [styles.overlay, dynamicOverlayStyles]
      }));
    });

    _defineProperty(this, "renderDrawer", () => {
      const {
        drawerBackgroundColor,
        drawerWidth,
        drawerPosition,
        drawerType,
        drawerContainerStyle,
        contentContainerStyle
      } = this.props;
      const fromLeft = drawerPosition === 'left';
      const drawerSlide = drawerType !== 'back';
      const containerSlide = drawerType !== 'front'; // we rely on row and row-reverse flex directions to position the drawer
      // properly. Apparently for RTL these are flipped which requires us to use
      // the opposite setting for the drawer to appear from left or right
      // according to the drawerPosition prop

      const reverseContentDirection = _reactNative.I18nManager.isRTL ? fromLeft : !fromLeft;
      const dynamicDrawerStyles = {
        backgroundColor: drawerBackgroundColor,
        width: drawerWidth
      };
      const openValue = this.openValue;
      (0, _invariant.default)(openValue, 'should be set');
      let containerStyles;

      if (containerSlide) {
        const containerTranslateX = openValue.interpolate({
          inputRange: [0, 1],
          outputRange: fromLeft ? [0, drawerWidth] : [0, -drawerWidth],
          extrapolate: 'clamp'
        });
        containerStyles = {
          transform: [{
            translateX: containerTranslateX
          }]
        };
      }

      let drawerTranslateX = 0;

      if (drawerSlide) {
        const closedDrawerOffset = fromLeft ? -drawerWidth : drawerWidth;
        drawerTranslateX = openValue.interpolate({
          inputRange: [0, 1],
          outputRange: [closedDrawerOffset, 0],
          extrapolate: 'clamp'
        });
      }

      const drawerStyles = {
        transform: [{
          translateX: drawerTranslateX
        }],
        flexDirection: reverseContentDirection ? 'row-reverse' : 'row'
      };
      return /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
        style: styles.main,
        onLayout: this.handleContainerLayout
      }, /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
        style: [drawerType === 'front' ? styles.containerOnBack : styles.containerInFront, containerStyles, contentContainerStyle],
        importantForAccessibility: this.drawerShown ? 'no-hide-descendants' : 'yes'
      }, typeof this.props.children === 'function' ? this.props.children(this.openValue) : this.props.children, this.renderOverlay()), /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
        pointerEvents: "box-none",
        ref: this.accessibilityIsModalView,
        accessibilityViewIsModal: this.drawerShown,
        style: [styles.drawerContainer, drawerStyles, drawerContainerStyle]
      }, /*#__PURE__*/React.createElement(_reactNative.View, {
        style: dynamicDrawerStyles
      }, this.props.renderNavigationView(this.openValue))));
    });

    _defineProperty(this, "setPanGestureRef", ref => {
      var _this$props$onGesture, _this$props5;

      // TODO(TS): make sure it is OK taken from
      // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065#issuecomment-596081842
      this.panGestureHandler.current = ref;
      (_this$props$onGesture = (_this$props5 = this.props).onGestureRef) === null || _this$props$onGesture === void 0 ? void 0 : _this$props$onGesture.call(_this$props5, ref);
    });

    const _dragX = new _reactNative.Animated.Value(0);

    const _touchX = new _reactNative.Animated.Value(0);

    const _drawerTranslation = new _reactNative.Animated.Value(0);

    this.state = {
      dragX: _dragX,
      touchX: _touchX,
      drawerTranslation: _drawerTranslation,
      containerWidth: 0
    };
    this.updateAnimatedEvent(_props, this.state);
  }

  UNSAFE_componentWillUpdate(props, state) {
    if (this.props.drawerPosition !== props.drawerPosition || this.props.drawerWidth !== props.drawerWidth || this.props.drawerType !== props.drawerType || this.state.containerWidth !== state.containerWidth) {
      this.updateAnimatedEvent(props, state);
    }
  }

  render() {
    const {
      drawerPosition,
      drawerLockMode,
      edgeWidth,
      minSwipeDistance
    } = this.props;
    const fromLeft = drawerPosition === 'left'; // gestureOrientation is 1 if the expected gesture is from left to right and
    // -1 otherwise e.g. when drawer is on the left and is closed we expect left
    // to right gesture, thus orientation will be 1.

    const gestureOrientation = (fromLeft ? 1 : -1) * (this.drawerShown ? -1 : 1); // When drawer is closed we want the hitSlop to be horizontally shorter than
    // the container size by the value of SLOP. This will make it only activate
    // when gesture happens not further than SLOP away from the edge

    const hitSlop = fromLeft ? {
      left: 0,
      width: this.drawerShown ? undefined : edgeWidth
    } : {
      right: 0,
      width: this.drawerShown ? undefined : edgeWidth
    };
    return /*#__PURE__*/React.createElement(_PanGestureHandler.PanGestureHandler // @ts-ignore could be fixed in handler types
    , {
      ref: this.setPanGestureRef,
      hitSlop: hitSlop,
      activeOffsetX: gestureOrientation * minSwipeDistance,
      failOffsetY: [-15, 15],
      onGestureEvent: this.onGestureEvent,
      onHandlerStateChange: this.openingHandlerStateChange,
      enableTrackpadTwoFingerGesture: this.props.enableTrackpadTwoFingerGesture,
      enabled: drawerLockMode !== 'locked-closed' && drawerLockMode !== 'locked-open'
    }, this.renderDrawer());
  }

}

exports.default = DrawerLayout;

_defineProperty(DrawerLayout, "defaultProps", {
  drawerWidth: 200,
  drawerPosition: 'left',
  useNativeAnimations: true,
  drawerType: 'front',
  edgeWidth: 20,
  minSwipeDistance: 3,
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  drawerLockMode: 'unlocked',
  enableTrackpadTwoFingerGesture: false
});

_defineProperty(DrawerLayout, "positions", {
  Left: 'left',
  Right: 'right'
});

const styles = _reactNative.StyleSheet.create({
  drawerContainer: { ..._reactNative.StyleSheet.absoluteFillObject,
    zIndex: 1001,
    flexDirection: 'row'
  },
  containerInFront: { ..._reactNative.StyleSheet.absoluteFillObject,
    zIndex: 1002
  },
  containerOnBack: { ..._reactNative.StyleSheet.absoluteFillObject
  },
  main: {
    flex: 1,
    zIndex: 0,
    overflow: 'hidden'
  },
  overlay: { ..._reactNative.StyleSheet.absoluteFillObject,
    zIndex: 1000
  }
});
//# sourceMappingURL=DrawerLayout.js.map