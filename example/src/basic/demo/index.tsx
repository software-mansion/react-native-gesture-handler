import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import Character from './components/character';
import GradientControls from './components/gradientControls';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const defaultColor: RGB = {
  r: 32,
  g: 32,
  b: 32,
};

export default function Demo() {
  const [upperColors, setUpperColors] = useState<RGB>(defaultColor);
  const [downColors, setDownColors] = useState<RGB>(defaultColor);

  const updateUpperGradient = (val: RGB) => {
    setUpperColors(val);
  };

  const updateDownGradient = (val: RGB) => {
    setDownColors(val);
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={[
        `rgba(${upperColors.r}, ${upperColors.g}, ${upperColors.b}, 1)`,
        `rgba(${downColors.r}, ${downColors.g}, ${downColors.b}, 1)`,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <GradientControls
        onChange={updateUpperGradient}
        style={[styles.gradientControl, styles.upperControl]}
      />
      <GradientControls
        onChange={updateDownGradient}
        style={[styles.gradientControl, styles.downControl]}
      />
      <Character />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  gradientControl: {
    position: 'absolute',
    left: 0,
    margin: 5,
  },

  upperControl: {
    top: 0,
  },

  downControl: {
    bottom: 0,
  },
});
