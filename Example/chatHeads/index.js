import React, { Component } from 'react';
import { StyleSheet, Image, View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';

import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const {
  set,
  cond,
  eq,
  add,
  multiply,
  lessThan,
  spring,
  block,
  startClock,
  stopClock,
  clockRunning,
  sub,
  defined,
  Value,
  Clock,
  event,
} = Animated;

function follow(clock, value) {
  const config = {
    damping: 28,
    mass: 0.3,
    stiffness: 188.296,
    overshootClamping: false,
    toValue: value,
  };

  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };
  return block([spring(clock, state, config), state.position]);
}

class Tracking extends Component {
  constructor(props) {
    super(props);

    const TOSS_SEC = 0.2;

    const dragX = new Value(0);
    const dragY = new Value(0);

    const animState = new Value(-1);
    const dragVX = new Value(0);
    const dragVY = new Value(0);

    this._onGestureEvent = event([
      {
        nativeEvent: {
          translationX: dragX,
          velocityX: dragVX,
          velocityY: dragVY,
          state: animState,
          translationY: dragY,
        },
      },
    ]);

    const transX = new Value();
    const transY = new Value(0);
    const prevDragX = new Value(0);
    const prevDragY = new Value(0);
    const clock = new Clock();
    const clock2 = new Clock();
    const snapPoint = cond(
      lessThan(add(transX, multiply(TOSS_SEC, dragVX)), 0),
      -(width / 2),
      width / 2
    );

    const config = {
      damping: 12,
      mass: 1,
      stiffness: 150,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: snapPoint,
    };

    const state = {
      finished: new Value(0),
      velocity: dragVX,
      position: new Value(0),
      time: new Value(0),
    };

    this._transX = cond(
      eq(animState, State.ACTIVE),
      [
        stopClock(clock),
        set(transX, add(transX, sub(dragX, prevDragX))),
        set(prevDragX, dragX),
        transX,
      ],
      [
        set(prevDragX, 0),
        set(
          transX,
          cond(
            defined(transX),
            [
              cond(clockRunning(clock), 0, [
                set(state.finished, 0),
                set(state.velocity, dragVX),
                set(state.position, transX),
                startClock(clock),
              ]),
              spring(clock, state, config),
              cond(state.finished, [stopClock(clock), stopClock(clock2)]),
              state.position,
            ],
            0
          )
        ),
      ]
    );

    this._transY = block([
      cond(
        eq(animState, State.ACTIVE),
        [
          set(transY, add(transY, sub(dragY, prevDragY))),
          set(prevDragY, dragY),
        ],
        set(prevDragY, 0)
      ),
      transY,
    ]);

    this.follow1x = follow(clock, this._transX);
    this.follow1y = follow(clock, this._transY);

    this.follow2x = follow(clock, this.follow1x);
    this.follow2y = follow(clock, this.follow1y);

    this.follow3x = follow(clock, this.follow2x);
    this.follow3y = follow(clock, this.follow2y);
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            transform: [
              { translateX: this.follow3x, translateY: this.follow3y },
            ],
          }}>
          <Image
            style={styles.box}
            source={{
              uri: 'https://avatars0.githubusercontent.com/u/379606?v=4&s=460',
            }}
          />
        </Animated.View>
        <Animated.View
          style={{
            transform: [
              { translateX: this.follow2x, translateY: this.follow2y },
            ],
          }}>
          <Image
            style={styles.box}
            source={{
              uri: 'https://avatars3.githubusercontent.com/u/90494?v=4&s=460',
            }}
          />
        </Animated.View>
        <Animated.View
          style={{
            transform: [
              { translateX: this.follow1x, translateY: this.follow1y },
            ],
          }}>
          <Image
            style={styles.box}
            source={{
              uri:
                'https://avatars3.githubusercontent.com/u/25709300?s=460&v=4',
            }}
          />
        </Animated.View>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onGestureEvent}>
          <Animated.View
            style={{
              transform: [
                { translateX: this._transX, translateY: this._transY },
              ],
            }}>
            <Image
              style={styles.box}
              source={{
                uri:
                  'https://avatars3.githubusercontent.com/u/726445?v=4&s=460',
              }}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Tracking />
      </View>
    );
  }
}

const BOX_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  box: {
    position: 'absolute',
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignSelf: 'center',
    borderColor: '#F5FCFF',
    backgroundColor: 'plum',
    borderRadius: BOX_SIZE / 2,
    margin: BOX_SIZE / 2,
  },
});
