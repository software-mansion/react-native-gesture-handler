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

  const show = (msg: string) => feedbackRef.current?.showMessage(msg);

  return (
    <View style={commonStyles.centered}>
      <View style={styles.retentionIndicator}>
        <View style={styles.slopIndicator}>
          <View style={styles.buttonContainer}>
            <TestingBase
              style={styles.pressable}
              hitSlop={HIT_SLOP}
              pressRetentionOffset={PRESS_RETENTION_OFFSET}
              onPressIn={() => show('Pressable pressed in')}
              onPressOut={() => show('Pressable pressed out')}
              onPress={() => show('Pressable pressed')}
              onHoverIn={() => show('Hovered in')}
              onHoverOut={() => show('Hovered out')}
              onLongPress={() => show('Long pressed')}
            />
          </View>
          <Text style={[commonStyles.caption, styles.indicatorLabel]}>
            Hit Slop
          </Text>
        </View>
        <Text style={[commonStyles.caption, styles.indicatorLabel]}>
          Retention Offset
        </Text>
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  pressable: {
    backgroundColor: COLORS.PURPLE,
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  indicatorLabel: {
    alignSelf: 'flex-end',
    marginRight: 8,
    marginBottom: 4,
  },
  slopIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100 + HIT_SLOP * 2,
    borderRightWidth: 2,
    borderColor: COLORS.KINDA_BLUE,
  },
  retentionIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 180 + PRESS_RETENTION_OFFSET * 2,
    borderRightWidth: 2,
    borderColor: COLORS.GRAY,
    marginVertical: 20,
  },
});
