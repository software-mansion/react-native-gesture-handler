import React, { RefObject, useRef } from 'react';
import { StyleSheet, Text, View, Platform, ScrollView } from 'react-native';
import {
  GestureHandlerRootView,
  Clickable,
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
          <Text style={styles.description}>No visual feedback by default</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Clickable (Base)"
              color={COLORS.NAVY}
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>RectButton Replacement</Text>
          <Text style={styles.description}>Underlay + Opacity Increase</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Clickable (Rect)"
              color={COLORS.PURPLE}
              activeOpacity={0.105}
              feedbackTarget="underlay"
              feedbackType="opacity-increase"
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BorderlessButton Replacement</Text>
          <Text style={styles.description}>Component + Opacity Decrease</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Clickable (Borderless)"
              color={COLORS.RED}
              activeOpacity={0.3}
              feedbackTarget="component"
              feedbackType="opacity-decrease"
              borderless
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Custom: Underlay + Decrease</Text>
          <Text style={styles.description}>Hides background on press</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Underlay Decrease"
              color={COLORS.GRAY}
              activeOpacity={0}
              feedbackTarget="underlay"
              feedbackType="opacity-decrease"
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Custom: Component + Increase</Text>
          <Text style={styles.description}>
            Hidden at rest, visible on press
          </Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Component Increase"
              color="black"
              activeOpacity={1}
              feedbackTarget="component"
              feedbackType="opacity-increase"
              feedback={feedbackRef}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Styled Underlay</Text>
          <View style={styles.row}>
            <ButtonWrapper
              name="Red Underlay"
              color={COLORS.NAVY}
              underlayColor="red"
              activeOpacity={0.5}
              feedbackTarget="underlay"
              feedbackType="opacity-increase"
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
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
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
