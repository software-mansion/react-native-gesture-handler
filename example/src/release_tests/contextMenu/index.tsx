import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  MouseButton,
} from 'react-native-gesture-handler';

export default function ContextMenuExample() {
  const p1 = Gesture.Pan().mouseButton(MouseButton.RIGHT);
  const p2 = Gesture.Pan();
  const p3 = Gesture.Pan();

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
    backgroundColor: 'lightblue',
  },

  parent: {
    width: 200,
    height: 200,
    backgroundColor: 'lightgreen',
  },

  child: {
    width: 100,
    height: 100,
    backgroundColor: 'crimson',
  },

  box: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
