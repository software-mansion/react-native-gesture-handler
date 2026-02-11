import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestingBase from './testingBase';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

const HIT_SLOP = 40;
const PRESS_RETENTION_OFFSET = HIT_SLOP;

export function HitSlopExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  const pressIn = () => {
    feedbackRef.current?.showMessage('Pressable pressed in');
  };

  const pressOut = () => {
    feedbackRef.current?.showMessage('Pressable pressed out');
  };

  const press = () => {
    feedbackRef.current?.showMessage('Pressable pressed');
  };

  const hoverIn = () => {
    feedbackRef.current?.showMessage('Hovered in');
  };

  const hoverOut = () => {
    feedbackRef.current?.showMessage('Hovered out');
  };

  const longPress = () => {
    feedbackRef.current?.showMessage('Long pressed');
  };

  return (
    <View style={[commonStyles.centerView]}>
      <View style={styles.retentionIndicator}>
        <View style={styles.slopIndicator}>
          <View style={styles.container}>
            <TestingBase
              style={styles.pressable}
              hitSlop={HIT_SLOP}
              pressRetentionOffset={PRESS_RETENTION_OFFSET}
              onPressIn={() => pressIn()}
              onPressOut={() => pressOut()}
              onPress={() => press()}
              onHoverIn={() => hoverIn()}
              onHoverOut={() => hoverOut()}
              onLongPress={() => longPress()}
            />
          </View>
          <Text style={styles.text}>Hit Slop</Text>
        </View>
        <Text style={styles.text}>Retention Offset</Text>
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 40,
  },
  pressable: {
    backgroundColor: COLORS.PURPLE,
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  text: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginRight: 6,
    marginTop: 12,
    color: COLORS.GRAY,
    fontWeight: 'bold',
  },
  slopIndicator: {
    display: 'flex',
    alignItems: 'center',
    width: 100 + HIT_SLOP * 2,
    borderRightWidth: 2,
    borderColor: COLORS.KINDA_BLUE,
  },
  retentionIndicator: {
    display: 'flex',
    alignItems: 'center',
    width: 180 + PRESS_RETENTION_OFFSET * 2,
    borderRightWidth: 2,
    borderColor: COLORS.GRAY,
    margin: 20,
  },
});
