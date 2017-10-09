import React, { Component } from 'react';
import { Alert, Animated, StyleSheet, Text, View } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  RectButton,
  BorderlessButton,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../common';

const RATIO = 3;
const DRAG_TOSS = 0.05;

export class SwipeableRow extends Component {
  static defaultProps = {
    friction: 1,
    useNativeAnimations: true,
  };

  constructor(props) {
    super(props);
    this._width = 0;
    const dragX = new Animated.Value(0);
    const rowTranslation = new Animated.Value(0);
    this.state = { dragX, rowTranslation };
    this._updateAnimatedEvent(props, this.state);
  }

  _updateAnimatedEvent = (props, state) => {
    const { friction, useNativeAnimations } = props;
    const { dragX, rowTranslation } = state;

    this._transX = Animated.add(
      rowTranslation,
      dragX.interpolate({
        inputRange: [0, friction],
        outputRange: [0, 1],
      })
    );
    this._showLeftAction = this._transX.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 0, 1],
    });
    this._leftActionOpacity = this._showLeftAction.interpolate({
      inputRange: [0, 0.1],
      outputRange: [0, 1],
    });
    this._showRightAction = this._transX.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [1, 0, 0],
    });
    this._rightActionOpacity = this._showRightAction.interpolate({
      inputRange: [0, 0.1],
      outputRange: [0, 1],
    });
    this._onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: this.state.dragX } }],
      { useNativeDriver: useNativeAnimations }
    );
  };

  _onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this._handleRelease(nativeEvent);
    }
  };

  _handleRelease = nativeEvent => {
    const { velocityX, translationX } = nativeEvent;
    const { width } = this.state;
    const {
      friction,
      leftThreshold = width / 2,
      leftOffset = width,
      rightThreshold = width / 2,
      rightOffset = width / 2,
    } = this.props;

    const startOffsetX = translationX / friction;
    const endOffsetX = (translationX + DRAG_TOSS * velocityX) / friction;

    if (endOffsetX > leftThreshold) {
      this._animateRow(startOffsetX, leftOffset, velocityX);
    } else if (endOffsetX < -rightThreshold) {
      this._animateRow(startOffsetX, -rightOffset, velocityX);
    }
  };

  _animateRow = (fromValue, toValue, velocityX) => {
    const { dragX, rowTranslation } = this.state;
    dragX.setValue(0);
    rowTranslation.setValue(fromValue);

    Animated.spring(this.state.dragX, {
      velocity: velocityX,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations,
    }).start();
  };

  _onLayout = ({ nativeEvent }) => {
    this.setState({ width: nativeEvent.layout.width });
  };

  _currentOffset = () => {
    const { rowState } = this.state;
    const { leftOffset = width, rightOffset = width / 2 } = this.props;
    if (rowState === 1) {
      return leftOffset;
    } else if (rowState === -1) {
      return -rightOffset;
    }
    return 0;
  };

  close = () => {
    this._animateRow(this._currentOffset(), 0);
  };

  render() {
    const { children, renderLeftActions, renderRightActions } = this.props;
    return (
      <PanGestureHandler
        {...this.props}
        minDeltaX={10}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View>
          <Animated.View
            style={[styles.leftActions, { opacity: this._leftActionOpacity }]}>
            {renderLeftActions && renderLeftActions(this._showLeftAction)}
          </Animated.View>
          <Animated.View
            style={[
              styles.rightActions,
              { opacity: this._rightActionOpacity },
            ]}>
            {renderLeftActions && renderRightActions(this._showLeftAction)}
          </Animated.View>
          <Animated.View
            style={{
              backgroundColor: 'white',
              transform: [{ translateX: this._transX }],
            }}
            onLayout={this._onLayout}>
            {children}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export class Swipeable extends Component {
  renderLeftActions = () => {
    return (
      <View
        style={{ flex: 1, backgroundColor: 'blue', justifyContent: 'center' }}>
        <View
          style={{ width: 30, height: 30, backgroundColor: 'red', margin: 5 }}
        />
      </View>
    );
    // <RectButton
    //   style={[styles.rowAction, styles.leftAction]}
    //   onPress={this.close}>
    //   <Text style={styles.actionButtonText}>Green</Text>
    // </RectButton>
  };
  renderRightActions = () => (
    <RectButton
      style={[styles.rowAction, styles.rightAction]}
      onPress={this.close}>
      <Text style={styles.actionButtonText}>Red</Text>
    </RectButton>
  );
  updateRef = ref => {
    this._swipeableRow = ref;
  };
  close = () => {
    this._swipeableRow.close();
  };
  render() {
    const { children } = this.props;
    return (
      <SwipeableRow
        ref={this.updateRef}
        friction={3}
        leftThreshold={30}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}>
        {children}
      </SwipeableRow>
    );
  }
}

export const InfoButton = props => (
  <BorderlessButton
    {...props}
    style={styles.infoButton}
    onPress={() => Alert.alert(`${props.name} info button clicked`)}>
    <View style={styles.infoButtonBorders}>
      <Text style={styles.infoButtonText}>i</Text>
    </View>
  </BorderlessButton>
);

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          waitFor={['dragbox', 'image_pinch', 'image_rotation', 'image_tilt']}
          style={styles.scrollView}>
          <LoremIpsum words={40} />
          <Swipeable>
            <RectButton
              style={styles.rectButton}
              onPress={() => Alert.alert('First row clicked')}>
              <Text style={styles.buttonText}>
                Swipe this row & observe highlight delay
              </Text>
              {/* Info icon will cancel when you scroll in the direction of the scrollview
                  but if you move finger horizontally it would allow you to "re-enter" into
                  an active state. This is typical for most of the buttons on iOS (but not
                  on Android where the touch cancels as soon as you leave the area of the
                  button). */}
              <InfoButton name="first" />
            </RectButton>
          </Swipeable>
          <View style={styles.buttonDelimiter} />
          <RectButton
            style={styles.rectButton}
            onPress={() => Alert.alert('Second row clicked')}>
            <Text style={styles.buttonText}>
              Second info icon will block scrolling
            </Text>
            {/* Info icon will block interaction with other gesture handlers including
                  the scrollview handler its a descendant of. This is typical for buttons
                  embedded in a scrollable content on iOS. */}
            <InfoButton disallowInterruption name="second" />
          </RectButton>
          <View style={styles.buttonDelimiter} />
          <RectButton
            style={styles.rectButton}
            onPress={() => Alert.alert('Third row clicked')}>
            <Text style={styles.buttonText}>
              This one will cancel when you drag outside
            </Text>
            {/* Info icon will cancel when you drag your finger outside of its bounds and
                  then back unlike all the previous icons that would activate when you re-enter
                  their activation area. This is a typical bahaviour for android but less frequent
                  for most of the iOS native apps. */}
            <InfoButton shouldCancelWhenOutside name="third" />
          </RectButton>
          <View style={styles.buttonDelimiter} />
          <Swipeable>
            <RectButton
              enabled={false}
              style={styles.rectButton}
              onPress={() => Alert.alert('Fourth row clicked')}>
              <Text style={styles.buttonText}>
                This row is "disabled" but you can swipe it
              </Text>
              <InfoButton name="fourth" />
            </RectButton>
          </Swipeable>
          <LoremIpsum />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rectButton: {
    flex: 1,
    height: 60,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  rowAction: {
    ...StyleSheet.absoluteFillObject,
  },
  leftActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  rightActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row-reverse',
  },
  leftAction: {
    backgroundColor: '#4CAF50',
  },
  rightAction: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonDelimiter: {
    height: 1,
    backgroundColor: '#999',
  },
  buttonText: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  infoButton: {
    width: 40,
    height: 40,
  },
  infoButtonBorders: {
    borderColor: '#467AFB',
    borderWidth: 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 10,
  },
  infoButtonText: {
    color: '#467AFB',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
});
