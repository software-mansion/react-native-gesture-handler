import { COLORS } from '../../../common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  MouseButton,
  usePanGesture,
} from 'react-native-gesture-handler';

export default function ContextMenuExample() {
  const p1 = usePanGesture({ mouseButton: MouseButton.RIGHT });
  const p2 = usePanGesture({});
  const p3 = usePanGesture({});

  return (
    <View style={styles.container}>
      <GestureDetector gesture={p1}>
        <View style={[styles.box, styles.grandParent]}>
          <GestureDetector gesture={p2} enableContextMenu={true}>
            <View style={[styles.box, styles.parent]}>
              <GestureDetector gesture={p3} enableContextMenu={false}>
                <View style={[styles.box, styles.child]} />
              </GestureDetector>
            </View>
          </GestureDetector>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  grandParent: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.NAVY,
  },

  parent: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.PURPLE,
  },

  child: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.KINDA_BLUE,
  },

  box: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
