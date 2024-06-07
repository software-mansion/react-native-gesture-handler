import React, { Component, PropsWithChildren, useRef } from 'react';
import { StyleSheet, I18nManager } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
} from 'react-native-reanimated';
import Swipeable, { SwipeableMethods } from 'src/new_api/swipeable/Swipeable';

export default class GmailStyleSwipeableRow extends Component<
  PropsWithChildren<unknown>
> {
  private renderLeftActions = (
    _progress: SharedValue<number>,
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
        <Animated.View
          style={[styles.actionIcon, { transform: [{ scale }] }]}
        />
      </RectButton>
    );
  };
  private renderRightActions = (
    _progress: SharedValue<number>,
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
        <Animated.View
          style={[styles.actionIcon, { transform: [{ scale }] }]}
        />
      </RectButton>
    );
  };

  private swipeableRow = useRef<SwipeableMethods>(null);

  private close = () => {
    this.swipeableRow.current?.close();
  };
  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.swipeableRow}
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
