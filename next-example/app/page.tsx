'use client';

import React, { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function App() {
  const [switched, setSwitched] = useState(false);
  const g = Gesture.Tap().onEnd(() => setSwitched((prev) => !prev));

  return (
    <div style={styles.container}>
      <GestureDetector gesture={g}>
        <div
          style={{
            ...styles.box,
            backgroundColor: switched ? '#1E4131' : 'crimson',
          }}
        />
      </GestureDetector>
    </div>
  );
}

const styles = {
  container: {
    width: '100wv',
    height: '100vh',

    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  box: {
    width: 300,
    height: 300,
    borderRadius: 50,
  },
};
