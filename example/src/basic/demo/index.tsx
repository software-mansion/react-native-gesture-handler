import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Character from './character';
import GradientControls from './gradientControls';

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

  const updateUpperGradient = (val) => {
    setUpperColors(val);
    console.log(upperColors);
  };

  const updateDownGradient = (val) => {
    setDownColors(val);
    console.log(downColors);
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={[
        `rgba(${upperColors.r}, ${upperColors.g}, ${upperColors.b}, 1)`,
        `rgba(${downColors.r}, ${downColors.g}, ${downColors.b}, 1)`,
        // 'rgba(0,0,0,1)',
        // 'red',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <GradientControls onChange={updateUpperGradient} />
      <Character />
      <GradientControls onChange={updateDownGradient} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    // backgroundColor: 'rgba(33,33,33,1)',
  },
});
