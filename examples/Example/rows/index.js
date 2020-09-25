import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  RectButton,
  BorderlessButton,
  LongPressGestureHandler,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum } from '../common';

const RATIO = 3;

export class Swipeable extends Component {
  constructor(props) {
    super(props);
    this._width = 0;
    this._dragX = new Animated.Value(0);
    this._transX = this._dragX.interpolate({
      inputRange: [0, RATIO],
      outputRange: [0, 1],
    });
    this._showLeftAction = this._dragX.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 0, 1],
    });
    this._showRightAction = this._dragX.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [1, 0, 0],
    });
    this._onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: this._dragX } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  _onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const dragToss = 0.05;
      const endOffsetX =
        event.nativeEvent.translationX + dragToss * event.nativeEvent.velocityX;

      let toValue = 0;
      if (endOffsetX > this._width / 2) {
        toValue = this._width * RATIO;
      } else if (endOffsetX < -this._width / 2) {
        toValue = -this._width * RATIO;
      }

      Animated.spring(this._dragX, {
        velocity: event.nativeEvent.velocityX,
        tension: 15,
        friction: 5,
        toValue,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };
  _onLayout = event => {
    this._width = event.nativeEvent.layout.width;
  };
  _reset = () => {
    Animated.spring(this._dragX, {
      toValue: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
      tension: 15,
      friction: 5,
    }).start();
  };
  render() {
    const { children } = this.props;
    return (
      <View>
        <Animated.View
          style={[styles.rowAction, { opacity: this._showLeftAction }]}>
          <RectButton
            style={[styles.rowAction, styles.leftAction]}
            onPress={this._reset}>
            <Text style={styles.actionButtonText}>Green</Text>
          </RectButton>
        </Animated.View>
        <Animated.View
          style={[styles.rowAction, { opacity: this._showRightAction }]}>
          <RectButton
            style={[styles.rowAction, styles.rightAction]}
            onPress={this._reset}>
            <Text style={styles.actionButtonText}>Red</Text>
          </RectButton>
        </Animated.View>
        <PanGestureHandler
          {...this.props}
          activeOffsetX={[-10, 10]}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}>
          <Animated.View
            style={{
              backgroundColor: 'white',
              transform: [{ translateX: this._transX }],
            }}
            onLayout={this._onLayout}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
}

export const InfoButton = props => (
  <BorderlessButton
    {...props}
    style={styles.infoButton}
    onPress={() => alert(`${props.name} info button clicked`)}>
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
              onPress={() => alert('First row clicked')}>
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
            onPress={() => alert('Second row clicked')}>
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
            rippleColor="red"
            style={styles.rectButton}
            onPress={() => alert('Third row clicked')}>
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
              onPress={() => alert('Fourth row clicked')}>
              <Text style={styles.buttonText}>
                This row is "disabled" but you can swipe it
              </Text>
              <InfoButton name="fourth" />
            </RectButton>
          </Swipeable>
          <LongPressGestureHandler
            onHandlerStateChange={({ nativeEvent }) =>
              nativeEvent.state === State.ACTIVE && alert('Long')
            }>
            <RectButton
              rippleColor="red"
              style={styles.rectButton}
              onPress={() => alert('Fifth row clicked')}>
              <Text style={styles.buttonText}>
                Clickable row with long press handler
              </Text>
            </RectButton>
          </LongPressGestureHandler>
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
    justifyContent: 'center',
    alignItems: 'center',
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
