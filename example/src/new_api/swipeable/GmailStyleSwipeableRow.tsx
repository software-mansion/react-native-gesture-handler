import React, { Component, PropsWithChildren } from 'react';
import { Animated, StyleSheet, I18nManager, View } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import {
  Extrapolation,
  SharedValue,
  interpolate,
} from 'react-native-reanimated';
import Swipeable from './Swipeable';

const AnimatedView = Animated.createAnimatedComponent(View);

export default class GmailStyleSwipeableRow extends Component<
  PropsWithChildren<unknown>
> {
  private renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: SharedValue<number>
  ) => {
    const scale = interpolate(
      dragX.value,
      [0, 80],
      [0, 1],
      Extrapolation.CLAMP
    );
    return (
      <RectButton style={styles.leftAction} onPress={this.close}>
        {/* Change it to some icons */}
        <AnimatedView style={[styles.actionIcon, { transform: [{ scale }] }]} />
      </RectButton>
    );
  };
  private renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: SharedValue<number>
  ) => {
    const scale = interpolate(
      dragX.value,
      [-80, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    return (
      <RectButton style={styles.rightAction} onPress={this.close}>
        {/* Change it to some icons */}
        <AnimatedView style={[styles.actionIcon, { transform: [{ scale }] }]} />
      </RectButton>
    );
  };

  private swipeableRow?: typeof Swipeable;

  private updateRef = (ref: typeof Swipeable) => {
    this.swipeableRow = ref;
  };
  private close = () => {
    this.swipeableRow?.close();
  };
  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#388e3c',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
    backgroundColor: 'plum',
    height: 20,
  },
  rightAction: {
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#dd2c00',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
