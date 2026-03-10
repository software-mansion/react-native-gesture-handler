import React, { RefObject, useRef } from 'react';
import { StyleSheet, Text, View, Platform, ScrollView } from 'react-native';
import {
  GestureHandlerRootView,
  Clickable,
  ClickablePreset,
} from 'react-native-gesture-handler';
import { COLORS, Feedback, FeedbackHandle } from '../../../common';

type ButtonWrapperProps = {
  name: string;
  color: string;
  feedback: RefObject<FeedbackHandle | null>;
  [key: string]: any;
};

function ButtonWrapper({ name, color, feedback, ...rest }: ButtonWrapperProps) {
  return (
    <Clickable
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => feedback.current?.showMessage(`[${name}] onPress`)}
      onLongPress={() => feedback.current?.showMessage(`[${name}] onLongPress`)}
      {...rest}>
      <Text style={styles.buttonText}>{name}</Text>
    </Clickable>
  );
}

export default function ClickableExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BaseButton Replacement</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Clickable (BaseButton)"
              color={COLORS.NAVY}
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>RectButton Replacement</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Clickable (RectButton)"
              color={COLORS.PURPLE}
              preset={ClickablePreset.RECT}
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BorderlessButton Replacement</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Clickable (BorderlessButton)"
              color={COLORS.RED}
              preset={ClickablePreset.BORDERLESS}
              feedback={feedbackRef}
            />
          </View>
        </View>

        <Feedback ref={feedbackRef} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { cursor: 'pointer' },
      android: { elevation: 3 },
    }),
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
