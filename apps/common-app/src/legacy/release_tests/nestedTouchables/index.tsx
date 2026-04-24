import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { LoremIpsum } from '../../../common';

export default function Example() {
  return (
    <ScrollView>
      <Text style={styles.text}>
        When the `exclusive` prop is set to true, the touchable is not allowed
        to begin recognizing gesture (thus it shouldn&apos;t show feedback) when
        another touchable is pressed. Similarly when the touchable with
        `exclusive` set to true is pressed, no other touchable should begin
        recognizing gesture.
      </Text>
      <Text style={styles.text}>Touchables with `exclusive` set to true:</Text>
      <Boxes />
      <Text style={styles.text}>
        When the `exclusive` prop is set to false, the touchable is allowed to
        begin recognizing gesture when another touchable (with `exclusive` prop
        set to false) is already pressed.
      </Text>
      <Text style={styles.text}>Touchables with `exclusive` set to false:</Text>
      <Boxes exclusive={false} />
      <Text style={styles.text}>Touchables with `exclusive` set to false:</Text>
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

const styles = StyleSheet.create({
  text: {
    padding: 10,
  },
});
