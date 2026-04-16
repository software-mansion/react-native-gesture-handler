import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

export default function RectButtonBorders() {
  return (
    <View style={styles.container}>
      <Button text="Border Radius" style={{ borderRadius: 16 }} />
      <Button
        text="Border Top Left Radius"
        style={{ borderTopLeftRadius: 16 }}
      />
      <Button
        text="Border Top Right Radius"
        style={{ borderTopRightRadius: 16 }}
      />
      <Button
        text="Border Bottom Left Radius"
        style={{ borderBottomLeftRadius: 16 }}
      />
      <Button
        text="Border Bottom Right Radius"
        style={{ borderBottomRightRadius: 16 }}
      />
      <Button
        text="Border Top Radius"
        style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      />
      <Button
        text="Border Bottom Radius"
        style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
      />
      <Button
        text="Border Radius and Top Radius"
        style={{
          borderRadius: 8,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      />
      <Button
        text="Border Radius and Bottom Radius"
        style={{
          borderRadius: 8,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      />
      <Button
        text="Border Dashed"
        style={{ borderStyle: 'dashed', borderWidth: 2, borderColor: 'red' }}
      />
      <Button
        text="Border Dotted"
        style={{ borderStyle: 'dotted', borderWidth: 2, borderColor: 'red' }}
      />
      <Button
        text="Border Solid"
        style={{ borderStyle: 'solid', borderWidth: 2, borderColor: 'red' }}
      />
    </View>
  );
}

type ButtonProps = {
  // RN cross-version conflicts prevent us from using `ViewStyle` with RNGH <= 2.21.0 and RN >= 0.75.0
  style: Record<string, string | number>;
  text: string;
};

function Button({ style, text }: ButtonProps) {
  const rectButtonStyles = [styles.button, style];

  // eslint-disable-next-line no-alert
  const onPress = () => alert(`Pressed ${text}!`);

  return (
    <RectButton style={rectButtonStyles} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
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
    borderWidth: 1,
    borderColor: '#001a72',
  },
  text: {
    color: '#f8f9ff',
    textAlign: 'center',
  },
});
