import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { RGB } from '..';
import Slider from './slider';

const COLORS = {
  RED: 'rgba(255,0,0,1)',
  GREEN: 'rgba(0,255,0,1)',
  BLUE: 'rgba(0,0,255,1)',
};

interface GradientControlProps {
  style: any[];
  onChange: (rgb: RGB) => void;
}

export default function GradientControls(props: GradientControlProps) {
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);

  const updateR = (val: number) => {
    setR(val);
    props.onChange({ r: r, g: g, b: b });
  };
  const updateG = (val: number) => {
    setG(val);
    props.onChange({ r: r, g: g, b: b });
  };
  const updateB = (val: number) => {
    setB(val);
    props.onChange({ r: r, g: g, b: b });
  };

  return (
    <View style={props.style}>
      <Slider color={COLORS.RED} onChange={updateR} />
      <Slider color={COLORS.GREEN} onChange={updateG} />
      <Slider color={COLORS.BLUE} onChange={updateB} />

      {/* @ts-ignore Types are ok */}
      <Text style={styles.text}>
        rgb({Math.round(r)},{Math.round(g)},{Math.round(b)})
      </Text>
    </View>
  );
}

const styles = {
  text: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 5,
  },
};
