import React from 'react';

import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { LoremIpsum } from '../../common';

export default function Example() {
  return (
    <ScrollView>
      <LoremIpsum words={40} />
      <Boxes />
      <LoremIpsum words={40} />
      <Boxes exclusive={false} />
      <LoremIpsum words={40} />
      <Boxes exclusive={false} />
      <LoremIpsum words={40} />
    </ScrollView>
  );
}

function Boxes(props: { exclusive?: boolean }) {
  return (
    <TouchableOpacity
      style={{ backgroundColor: 'red', width: 300, height: 300 }}
      extraButtonProps={{
        exclusive: props.exclusive ?? true,
        rippleColor: 'transparent',
      }}>
      <TouchableOpacity
        style={{ backgroundColor: 'green', width: 200, height: 200 }}
        extraButtonProps={{
          exclusive: props.exclusive ?? true,
          rippleColor: 'transparent',
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'blue',
            width: 100,
            height: 100,
          }}
          extraButtonProps={{
            exclusive: props.exclusive ?? true,
            rippleColor: 'transparent',
          }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
