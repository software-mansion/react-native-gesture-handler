import React, { useRef } from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

export default function RectButtonBorders() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  const handlePress = (text: string) => {
    feedbackRef.current?.showMessage(`Pressed ${text}!`);
  };

  return (
    <View style={commonStyles.centerView}>
      <View style={styles.container}>
        <Button
          text="Border Radius"
          style={{ borderRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Top Left Radius"
          style={{ borderTopLeftRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Top Right Radius"
          style={{ borderTopRightRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Bottom Left Radius"
          style={{ borderBottomLeftRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Bottom Right Radius"
          style={{ borderBottomRightRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Top Radius"
          style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Bottom Radius"
          style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
          onPress={handlePress}
        />
        <Button
          text="Border Radius and Top Radius"
          style={{
            borderRadius: 8,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
          onPress={handlePress}
        />
        <Button
          text="Border Radius and Bottom Radius"
          style={{
            borderRadius: 8,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
          onPress={handlePress}
        />
        <Button
          text="Border Dashed"
          style={{
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: COLORS.RED,
          }}
          onPress={handlePress}
        />
        <Button
          text="Border Dotted"
          style={{
            borderStyle: 'dotted',
            borderWidth: 2,
            borderColor: COLORS.RED,
          }}
          onPress={handlePress}
        />
        <Button
          text="Border Solid"
          style={{
            borderStyle: 'solid',
            borderWidth: 2,
            borderColor: COLORS.RED,
          }}
          onPress={handlePress}
        />
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

type ButtonProps = {
  style: StyleProp<ViewStyle>;
  text: string;
  onPress: (text: string) => void;
};

function Button({ style, text, onPress }: ButtonProps) {
  return (
    <RectButton style={[styles.button, style]} onPress={() => onPress(text)}>
      <Text style={styles.text}>{text}</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: COLORS.offWhite,
  },
  button: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.NAVY,
  },
  text: {
    color: COLORS.offWhite,
    textAlign: 'center',
    fontSize: 12,
  },
});
