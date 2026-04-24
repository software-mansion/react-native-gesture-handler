import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  PanGestureHandler,
  NativeViewGestureHandler,
  State,
  TapGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../../../common';
import { USE_NATIVE_DRIVER } from '../../../config';

type BottomSheetState = {
  lastSnap: number;
};

const HEADER_HEIGHT = 50;
const windowHeight = Dimensions.get('window').height;
const SNAP_POINTS_FROM_TOP = [50, windowHeight * 0.4, windowHeight * 0.8];

export class BottomSheet extends Component<
  Record<string, unknown>,
  BottomSheetState
> {
  private masterdrawer = React.createRef<TapGestureHandler>();
  private drawer = React.createRef<PanGestureHandler>();
  private drawerheader = React.createRef<PanGestureHandler>();
  private scroll = React.createRef<NativeViewGestureHandler>();
  private lastScrollYValue: number;
  private lastScrollY: Animated.Value;
  private onRegisterLastScroll: (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => void;
  private dragY: Animated.Value;
  private onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  private reverseLastScrollY: Animated.AnimatedMultiplication<number>;
  private translateYOffset: Animated.Value;
  private translateY: Animated.AnimatedInterpolation<number>;
  constructor(props: Record<string, unknown>) {
    super(props);
    const START = SNAP_POINTS_FROM_TOP[0];
    const END = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

    this.state = {
      lastSnap: END,
    };

    this.lastScrollYValue = 0;
    this.lastScrollY = new Animated.Value(0);
    this.onRegisterLastScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.lastScrollY } } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
    this.lastScrollY.addListener(({ value }) => {
      this.lastScrollYValue = value;
    });

    this.dragY = new Animated.Value(0);
    this.onGestureEvent = Animated.event(
      [{ nativeEvent: { translationY: this.dragY } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    this.reverseLastScrollY = Animated.multiply(
      new Animated.Value(-1),
      this.lastScrollY
    );

    this.translateYOffset = new Animated.Value(END);
    this.translateY = Animated.add(
      this.translateYOffset,
      Animated.add(this.dragY, this.reverseLastScrollY)
    ).interpolate({
      inputRange: [START, END],
      outputRange: [START, END],
      extrapolate: 'clamp',
    });
  }
  private onHeaderHandlerStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.BEGAN) {
      this.lastScrollY.setValue(0);
    }
    this.onHandlerStateChange({ nativeEvent });
  };
  private onHandlerStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      let { velocityY, translationY } = nativeEvent;
      translationY -= this.lastScrollYValue;
      const dragToss = 0.05;
      const endOffsetY =
        this.state.lastSnap + translationY + dragToss * velocityY;

      let destSnapPoint = SNAP_POINTS_FROM_TOP[0];
      for (const snapPoint of SNAP_POINTS_FROM_TOP) {
        const distFromSnap = Math.abs(snapPoint - endOffsetY);
        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
          destSnapPoint = snapPoint;
        }
      }
      this.setState({ lastSnap: destSnapPoint });
      this.translateYOffset.extractOffset();
      this.translateYOffset.setValue(translationY);
      this.translateYOffset.flattenOffset();
      this.dragY.setValue(0);
      Animated.spring(this.translateYOffset, {
        velocity: velocityY,
        tension: 68,
        friction: 12,
        toValue: destSnapPoint,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };
  render() {
    return (
      <TapGestureHandler
        maxDurationMs={100000}
        ref={this.masterdrawer}
        maxDeltaY={this.state.lastSnap - SNAP_POINTS_FROM_TOP[0]}>
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [{ translateY: this.translateY }],
              },
            ]}>
            <PanGestureHandler
              ref={this.drawerheader}
              simultaneousHandlers={[this.scroll, this.masterdrawer]}
              shouldCancelWhenOutside={false}
              enableTrackpadTwoFingerGesture
              onGestureEvent={this.onGestureEvent}
              onHandlerStateChange={this.onHeaderHandlerStateChange}>
              <Animated.View style={styles.header} />
            </PanGestureHandler>
            <PanGestureHandler
              ref={this.drawer}
              simultaneousHandlers={[this.scroll, this.masterdrawer]}
              shouldCancelWhenOutside={false}
              onGestureEvent={this.onGestureEvent}
              enableTrackpadTwoFingerGesture
              onHandlerStateChange={this.onHandlerStateChange}>
              <Animated.View style={styles.container}>
                <NativeViewGestureHandler
                  ref={this.scroll}
                  waitFor={this.masterdrawer}
                  simultaneousHandlers={this.drawer}>
                  <Animated.ScrollView
                    style={{ marginBottom: SNAP_POINTS_FROM_TOP[0] }}
                    bounces={false}
                    onScrollBeginDrag={this.onRegisterLastScroll}
                    scrollEventThrottle={1}>
                    <LoremIpsum />
                    <LoremIpsum />
                    <LoremIpsum />
                  </Animated.ScrollView>
                </NativeViewGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </View>
      </TapGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <BottomSheet />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: 'red',
  },
});
