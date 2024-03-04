import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from '../../../../src/components/GestureButtons';

export default function RectButtonBorders() {
  return (
    <View style={styles.container}>
      <Button type="borderRadius" />
      <Button type="borderTopLeftRadius" />
      <Button type="borderTopRightRadius" />
      <Button type="borderBottomLeftRadius" />
      <Button type="borderBottomRightRadius" />
      <RectButton
        style={[
          styles.button,
          { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
        ]}
        onPress={() => alert(`Pressed borderTopRadius!`)}>
        <Text>border Top Radius</Text>
      </RectButton>
      <RectButton
        style={[
          styles.button,
          { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
        ]}
        onPress={() => alert(`Pressed borderTopRadius!`)}>
        <Text>border Bottom Radius</Text>
      </RectButton>
    </View>
  );
}

type BorderTypes =
  | 'borderRadius'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius';

function Button({ type }: { type: BorderTypes }) {
  return (
    <RectButton
      style={[styles.button, { [type]: 16 }]}
      onPress={() => alert(`Pressed ${type}!`)}>
      <Text style={styles.text}>{type}</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
  },
  button: {
    width: 100,
    height: 100,
    backgroundColor: '#782aeb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  text: {
    color: '#f8f9ff',
  },
});
