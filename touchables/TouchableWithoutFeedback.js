import React, { Component } from 'react';
import { Animated } from 'react-native';
import {
  TapGestureHandler,
  State,
  LongPressGestureHandler,
  PanGestureHandler,
} from '../GestureHandler';
import PropTypes from 'prop-types';

// Copied from RN's implementation
const PRESS_RETENTION_OFFSET = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 30,
};

/**
 * Each touchable is a states' machine which preforms transitions.
 * On very beginning (and on the very end or recognition) touchable is
 * UNDERMINED. Then it moves to BEGAN. If touchable recognizes that finger
 * travel outside it transits to special MOVED_OUTSIDE state. Gesture recognition
 * finishes in UNDETERMINED state.
 */
export const TOUCHABLE_STATE = {
  UNDETERMINED: 0,
  BEGAN: 1,
  MOVED_OUTSIDE: 2,
};

/**
 * TouchableWithoutFeedback is not intent to be used.
 * Should be treated as a superclass for the rest of touchables
 */

export default class TouchableWithoutFeedback extends Component {
  static propTypes = {
    // Decided to drop not used fields from RN's implementation.
    // e.g. onBlur and onFocus as well as deprecated props.
    accessible: PropTypes.bool,
    accessibilityLabel: PropTypes.node,
    accessibilityHint: PropTypes.string,
    hitSlop: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      bottom: PropTypes.number,
      right: PropTypes.number,
    }),
    pressRetentionOffset: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      bottom: PropTypes.number,
      right: PropTypes.number,
    }),
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    onPressIn: PropTypes.func,
    onPressOut: PropTypes.func,
    onLayout: PropTypes.func,
    onLongPress: PropTypes.func,
    nativeID: PropTypes.string,
    testID: PropTypes.string,
    delayPressIn: PropTypes.number,
    delayPressOut: PropTypes.number,
    delayLongPress: PropTypes.number,
  };

  static defaultProps = {
    delayLongPress: 600,
  };

  // timeout handlers
  pressInTimeout;
  pressOutTimeout;

  // This flag is required since recognition of longPress implies not-invoking onPress
  longPressDetected = false;
  // One move outside implies that no longPress event will be called later
  movedOutside = false;

  pointerInside = true;

  // State of touchable
  STATE = TOUCHABLE_STATE.UNDETERMINED;

  // There's defined  tho "hitSlops". First (props.hitSlop) defines when finger "inside"  component.
  // Particularly it means how far can user start touching. ExternalHitSlop defines how far
  // could finger travel without UI changes.
  getHitSlop = () => {
    const externalHitSlop =
      this.props.pressRetentionOffset || PRESS_RETENTION_OFFSET;
    const { hitSlop } = this.props;
    if (hitSlop) {
      const { left = 0, right = 0, top = 0, bottom = 0 } = hitSlop;
      return {
        top: top + externalHitSlop.top,
        bottom: bottom + externalHitSlop.bottom,
        left: left + externalHitSlop.left,
        right: right + externalHitSlop.right,
      };
    } else {
      return externalHitSlop;
    }
  };

  // handlePressIn in called on first touch on traveling inside component.
  // Handles state transition with delay.
  handlePressIn = () => {
    if (this.props.delayPressIn) {
      this.pressInTimeout = setTimeout(
        () => this.moveToState(TOUCHABLE_STATE.BEGAN),
        this.props.delayPressIn
      );
    } else {
      this.moveToState(TOUCHABLE_STATE.BEGAN);
    }
  };
  // handleMoveOutside in called on traveling outside component.
  // Handles state transition with delay.
  handleMoveOutside = () => {
    if (this.props.delayPressOut) {
      this.pressOutTimeout =
        this.pressOutTimeout ||
        setTimeout(() => {
          this.moveToState(TOUCHABLE_STATE.MOVED_OUTSIDE);
          this.pressOutTimeout = null;
        }, this.props.delayPressOut);
    } else {
      this.moveToState(TOUCHABLE_STATE.MOVED_OUTSIDE);
    }
  };

  // handleGoToUndermined transits to UNDETERMINED state with proper delay
  handleGoToUndermined = () => {
    clearTimeout(this.pressOutTimeout);
    if (this.props.delayPressOut) {
      this.pressOutTimeout = setTimeout(() => {
        this.moveToState(TOUCHABLE_STATE.UNDETERMINED);
        this.pressOutTimeout = null;
      }, this.props.delayPressOut);
    } else {
      this.moveToState(TOUCHABLE_STATE.UNDETERMINED);
    }
  };

  componentDidMount() {
    this.reset();
  }
  // reset timeout to prevent memory leaks.
  reset() {
    this.longPressDetected = false;
    this.movedOutside = false;
    this.pointerInside = true;
    clearTimeout(this.pressInTimeout);
    clearTimeout(this.pressOutTimeout);
    this.pressOutTimeout = null;
    this.pressInTimeout = null;
  }

  // All states' transitions are defined here.
  moveToState = newState => {
    if (newState === this.STATE) {
      // Ignore dummy transitions
      return;
    }
    if (newState === TOUCHABLE_STATE.BEGAN) {
      // First touch and moving inside
      this.props.onPressIn && this.props.onPressIn();
    } else if (newState === TOUCHABLE_STATE.MOVED_OUTSIDE) {
      // Moving outside
      this.props.onPressOut && this.props.onPressOut();
    } else if (newState === TOUCHABLE_STATE.UNDETERMINED) {
      // Need to reset each time on transition to UNDETERMINED
      this.reset();
      if (this.STATE === TOUCHABLE_STATE.BEGAN) {
        // ... and if it happens inside button.
        this.props.onPressOut && this.props.onPressOut();
      }
    }
    // Finally call lister (used by subclasses)
    this.onStateChange && this.onStateChange(this.STATE, newState);
    // ... and make transition.
    this.STATE = newState;
  };

  onGestureEvent = ({ nativeEvent: { pointerInside } }) => {
    if (this.pointerInside !== pointerInside) {
      if (pointerInside) {
        this.onMoveIn();
      } else {
        this.onMoveOut();
      }
    }
    this.pointerInside = pointerInside;
  };

  onTapStateChange = ({ nativeEvent }) => {
    const { state } = nativeEvent;
    if (state === State.CANCELLED || state === State.FAILED) {
      // Need to handle case with external cancellation (e.g. by ScrollView)
      this.moveToState(TOUCHABLE_STATE.UNDETERMINED);
    } else if (
      state === State.BEGAN &&
      this.STATE === TOUCHABLE_STATE.UNDETERMINED &&
      this.isWithinBounds(nativeEvent)
    ) {
      // Moving inside requires
      this.handlePressIn();
    } else if (state === State.END) {
      if (this.STATE === TOUCHABLE_STATE.UNDETERMINED) {
        if (this.isWithinBounds(nativeEvent)) {
          this.moveToState(TOUCHABLE_STATE.BEGAN);
        } else if (this.pressInTimeout) {
          clearTimeout(this.pressInTimeout);
          this.pressInTimeout = null;
          this.moveToState(TOUCHABLE_STATE.BEGAN);
        }
      }
      const shouldCallOnPress =
        !this.longPressDetected &&
        this.STATE !== TOUCHABLE_STATE.MOVED_OUTSIDE &&
        this.pressOutTimeout === null;

      this.handleGoToUndermined();
      if (shouldCallOnPress) {
        // Calls only inside component whether no long press was called previously
        this.props.onPress && this.props.onPress();
      }
      this.longPressDetected = false;
    }
  };

  onLongPressStateChange = ({ nativeEvent: { state } }) => {
    // Handle only if state is active and finger didn't move outside component.
    if (
      state === State.ACTIVE &&
      this.props.onLongPress &&
      !this.movedOutside
    ) {
      this.longPressDetected = true;
      this.props.onLongPress();
    }
  };

  componentWillUnmount() {
    // to prevent memory leaks
    this.reset();
  }

  onMoveIn = () => {
    if (this.STATE === TOUCHABLE_STATE.MOVED_OUTSIDE) {
      // This call is not throttles with delays (like in RN's implementation).
      this.moveToState(TOUCHABLE_STATE.BEGAN);
    }
  };

  onMoveOut = () => {
    // flag for longPress detection
    this.movedOutside = true;
    if (this.STATE === TOUCHABLE_STATE.BEGAN) {
      this.handleMoveOutside();
    }
  };

  // Measure component for deciding if finger is inside
  onLayout = ({
    nativeEvent: {
      layout: { width, height },
    },
  }) => {
    this.width = width;
    this.height = height;
  };

  // check whether finger is inside component (including hitSlop)
  isWithinBounds = ({ x, y }) => {
    const { hitSlop } = this.props;
    if (hitSlop) {
      const { left = 0, right = 0, top = 0, bottom = 0 } = hitSlop;
      return (
        x > -left &&
        x < this.width + right &&
        y > -bottom &&
        y < this.height + top
      );
    } else {
      return x > 0 && x < this.width && y > 0 && y < this.height;
    }
  };

  // Method for overriding
  renderChildren(children) {
    return children;
  }

  tap = React.createRef();
  long = React.createRef();
  pan = React.createRef();
  render() {
    const extraProps = {
      accessible: this.props.accessible !== false,
      accessibilityLabel: this.props.accessibilityLabel,
      accessibilityHint: this.props.accessibilityHint,
      accessibilityComponentType: this.props.accessibilityComponentType,
      accessibilityRole: this.props.accessibilityRole,
      accessibilityStates: this.props.accessibilityStates,
      accessibilityTraits: this.props.accessibilityTraits,
      nativeID: this.props.nativeID,
      testID: this.props.testID,
      onLayout: this.props.onLayout,
      hitSlop: this.props.hitSlop,
    };

    return (
      <PanGestureHandler
        ref={this.pan}
        onHandlerStateChange={this.onTapStateChange}
        onGestureEvent={this.onGestureEvent}
        hitSlop={this.getHitSlop()}
        simultaneousHandlers={[this.long, this.tap]}
        shouldCancelWhenOutside={false}>
        <TapGestureHandler
          onHandlerStateChange={this.onTapStateChange}
          maxDurationMs={100000}
          ref={this.native}
          hitSlop={this.getHitSlop()}
          simultaneousHandlers={[this.long, this.pan]}
          shouldCancelWhenOutside={false}>
          <Animated.View
            {...extraProps}
            style={[this.style, this.state && this.state.extraUnderlayStyle]}
            onLayout={this.onLayout}>
            {this.props.onLongPress ? (
              <LongPressGestureHandler
                onHandlerStateChange={this.onLongPressStateChange}
                minDurationMs={
                  (this.props.delayPressIn || 0) +
                  (this.props.delayLongPress || 0)
                }
                ref={this.long}
                simultaneousHandlers={[this.tap, this.pan]}>
                {this.renderChildren(this.props.children)}
              </LongPressGestureHandler>
            ) : (
              this.renderChildren(this.props.children)
            )}
          </Animated.View>
        </TapGestureHandler>
      </PanGestureHandler>
    );
  }
}
