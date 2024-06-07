import React, { Component, PropsWithChildren } from 'react';
import { Animated, StyleSheet, Text, View, I18nManager } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import {
  Extrapolation,
  SharedValue,
  interpolate,
} from 'react-native-reanimated';
import Swipeable, { SwipeableRef } from 'src/new_api/swipeable/Swipeable';

export default class AppleStyleSwipeableRow extends Component<
  PropsWithChildren<unknown>
> {
  private renderLeftActions = (
    _progress: SharedValue<number>,
    dragX: SharedValue<number>
  ) => {
    const trans = interpolate(
      dragX.value,
      [0, 50, 100, 101],
      [-20, 0, 0, 1],
      Extrapolation.CLAMP
    );
    return (
      <RectButton style={styles.leftAction} onPress={this.close}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  };

  private renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: SharedValue<number>
  ) => {
    const trans = interpolate(progress.value, [0, 1], [x, 0]);
    const pressHandler = () => {
      this.close();
      // eslint-disable-next-line no-alert
      window.alert(text);
    };

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}>
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  private renderRightActions = (
    progress: SharedValue<number>,
    _dragAnimatedValue: SharedValue<number>
  ) => (
    <View
      style={{
        width: 192,
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      }}>
      {this.renderRightAction('More', '#C8C7CD', 192, progress)}
      {this.renderRightAction('Flag', '#ffab00', 128, progress)}
      {this.renderRightAction('More', '#dd2c00', 64, progress)}
    </View>
  );

  private swipeableRow?: SwipeableRef;

  private updateRef = (ref: SwipeableRef) => {
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
        enableTrackpadTwoFingerGesture
        leftThreshold={30}
        rightThreshold={40}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}
        onSwipeableOpen={(direction) => {
          console.log(`Opening swipeable from the ${direction}`);
        }}
        onSwipeableClose={(direction) => {
          console.log(`Closing swipeable to the ${direction}`);
        }}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#497AFC',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
