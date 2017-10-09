import React, { Component } from 'react';
import { Alert, Animated, StyleSheet, Text, View } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  RectButton,
  BorderlessButton,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../common';

const DRAG_TOSS = 0.05;

export class SwipeableRow extends Component {
  static defaultProps = {
    friction: 1,
    useNativeAnimations: true,
  };

  constructor(props) {
    super(props);
    const dragX = new Animated.Value(0);
    const rowTranslation = new Animated.Value(0);
    this.state = { dragX, rowTranslation };
    this._updateAnimatedEvent(props, this.state);
  }

  componentWillUpdate(props, state) {
    if (
      this.props.friction !== props.friction ||
      this.state.leftWidth !== state.leftWidth ||
      this.state.rightOffset !== state.rightOffset ||
      this.state.rowWidth !== state.rowWidth
    ) {
      this._updateAnimatedEvent(props, state);
    }
  }

  _updateAnimatedEvent = (props, state) => {
    const { friction, useNativeAnimations } = props;
    const {
      dragX,
      rowTranslation,
      leftWidth = 1,
      rowWidth = 1,
      rightOffset = 0,
    } = state;
    const rightWidth = Math.max(0, rowWidth - rightOffset);

    this._transX = Animated.add(
      rowTranslation,
      dragX.interpolate({
        inputRange: [0, friction],
        outputRange: [0, 1],
      })
    );
    this._showLeftAction = this._transX.interpolate({
      inputRange: [-1, 0, leftWidth],
      outputRange: [0, 0, 1],
    });
    this._leftActionOpacity = this._showLeftAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [0, 1],
    });
    this._showRightAction = this._transX.interpolate({
      inputRange: [-rightWidth, 0, 1],
      outputRange: [1, 0, 0],
    });
    this._rightActionOpacity = this._showRightAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [0, 1],
    });
    this._onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: this.state.dragX } }],
      { useNativeDriver: useNativeAnimations }
    );
  };

  _onTapHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this.close();
    }
  };

  _onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this._handleRelease(nativeEvent);
    }
  };

  _handleRelease = nativeEvent => {
    const { velocityX, translationX: dragX } = nativeEvent;
    const { leftWidth, rowWidth, rightOffset, rowState } = this.state;
    const rightWidth = rowWidth - rightOffset;
    const {
      friction,
      leftThreshold = leftWidth / 2,
      rightThreshold = rightWidth / 2,
    } = this.props;

    const startOffsetX = this._currentOffset() + dragX / friction;
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

    this._animateRow(startOffsetX, toValue, velocityX);
  };

  _animateRow = (fromValue, toValue, velocityX) => {
    const { dragX, rowTranslation } = this.state;
    dragX.setValue(0);
    rowTranslation.setValue(fromValue);

    this.setState({ rowState: Math.sign(toValue) });
    Animated.spring(rowTranslation, {
      velocity: velocityX,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations,
    }).start();
  };

  _onRowLayout = ({ nativeEvent }) => {
    this.setState({ rowWidth: nativeEvent.layout.width });
  };

  _currentOffset = () => {
    const { leftWidth, rowWidth, rightOffset, rowState } = this.state;
    const rightWidth = rowWidth - rightOffset;
    if (rowState === 1) {
      return leftWidth;
    } else if (rowState === -1) {
      return -rightWidth;
    }
    return 0;
  };

  close = () => {
    this._animateRow(this._currentOffset(), 0);
  };

  render() {
    const { rowState } = this.state;
    const { children, renderLeftActions, renderRightActions } = this.props;

    const left = renderLeftActions && (
      <Animated.View
        pointerEvents={rowState === 1 ? 'auto' : 'none'}
        style={[styles.leftActions, { opacity: this._leftActionOpacity }]}>
        {renderLeftActions(this._showLeftAction, this._transX)}
        <View
          onLayout={({ nativeEvent }) =>
            this.setState({ leftWidth: nativeEvent.layout.x })}
        />
      </Animated.View>
    );

    const right = renderRightActions && (
      <Animated.View
        pointerEvents={rowState === -1 ? 'auto' : 'none'}
        style={[styles.rightActions, { opacity: this._rightActionOpacity }]}>
        {renderRightActions(this._showRightAction, this._transX)}
        <View
          onLayout={({ nativeEvent }) =>
            this.setState({ rightOffset: nativeEvent.layout.x })}
        />
      </Animated.View>
    );

    return (
      <PanGestureHandler
        {...this.props}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View onLayout={this._onRowLayout}>
          {left}
          {right}
          <TapGestureHandler
            enabled={rowState !== 0}
            onHandlerStateChange={this._onTapHandlerStateChange}>
            <Animated.View
              pointerEvents={rowState === 0 ? 'auto' : 'box-only'}
              style={{
                overflow: 'hidden',
                transform: [{ translateX: this._transX }],
              }}>
              {children}
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export class Swipeable extends Component {
  renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton
        style={{
          flex: 1,
          backgroundColor: '#497AFC',
          justifyContent: 'center',
        }}
        onPress={this.close}>
        <Animated.Text
          style={{
            color: 'white',
            fontSize: 16,
            backgroundColor: 'transparent',
            padding: 10,
            transform: [{ translateX: trans }],
          }}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  };
  renderRightActions = progress => {
    const t1 = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [64, 0],
    });
    const t2 = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [128, 0],
    });
    const t3 = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [192, 0],
    });
    return (
      <View style={{ width: 192, flexDirection: 'row' }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: t3 }] }}>
          <RectButton
            style={{
              alignItems: 'center',
              flex: 1,
              backgroundColor: '#C8C7CD',
              justifyContent: 'center',
            }}
            onPress={this.close}>
            <Text
              style={{
                color: 'white',
                backgroundColor: 'transparent',
                fontSize: 16,
                padding: 10,
              }}>
              More
            </Text>
          </RectButton>
        </Animated.View>
        <Animated.View style={{ flex: 1, transform: [{ translateX: t2 }] }}>
          <RectButton
            style={{
              flex: 1,
              backgroundColor: '#E49B26',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={this.close}>
            <Text
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: 16,
                padding: 10,
              }}>
              Flag
            </Text>
          </RectButton>
        </Animated.View>
        <Animated.View style={{ flex: 1, transform: [{ translateX: t1 }] }}>
          <RectButton
            style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: '#D95139',
              justifyContent: 'center',
            }}
            onPress={this.close}>
            <Text
              style={{
                color: 'white',
                backgroundColor: 'transparent',
                fontSize: 16,
                padding: 10,
              }}>
              Trash
            </Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };
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
        friction={2}
        leftThreshold={30}
        rightThreshold={40}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'transparent',
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
