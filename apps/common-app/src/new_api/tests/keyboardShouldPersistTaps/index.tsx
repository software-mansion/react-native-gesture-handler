import React, { useRef, useState } from 'react';

import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Pressable as RNGHPressable,
  ScrollView as RNGHScrollView,
  TextInput as RNGHTextInput,
} from 'react-native-gesture-handler';

import { COLORS, Feedback, FeedbackHandle, InfoSection } from '../../../common';

type Mode = 'never' | 'handled' | 'always';

const MODES: Mode[] = ['never', 'handled', 'always'];

const MODE_DESCRIPTIONS: Record<Mode, string> = {
  never:
    "RN: first tap outside the input dismisses the keyboard AND is swallowed — press doesn't fire. GH: keyboard still dismisses (ScrollView captures the responder normally), but the press ALSO fires because GH's native recognizer runs in parallel to the JS responder system.",
  handled:
    'Keyboard stays up if a child claims the tap. Tap an input to raise the keyboard, then tap a button — press fires and keyboard stays. RN and GH match here.',
  always:
    "Keyboard never auto-dismisses on tap; children always receive taps. You'd have to call Keyboard.dismiss() yourself. RN and GH match here.",
};

export default function KeyboardShouldPersistTapsExample() {
  const [mode, setMode] = useState<Mode>('handled');
  const feedbackRef = useRef<FeedbackHandle>(null);

  const report = (message: string) => {
    feedbackRef.current?.showMessage(message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <ModeSelector value={mode} onChange={setMode} />
        <RNPressable style={styles.dismiss} onPress={() => Keyboard.dismiss()}>
          <Text style={styles.dismissText}>Dismiss KB</Text>
        </RNPressable>
      </View>

      <View style={styles.panelRow}>
        <Panel
          title="React Native"
          accent={COLORS.NAVY}
          ScrollViewComponent={RNScrollView}
          mode={mode}>
          <RNTextInput
            style={styles.input}
            placeholder="RN input"
            placeholderTextColor={COLORS.GRAY}
          />
          <RNPressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed
                  ? COLORS.KINDA_BLUE
                  : COLORS.LIGHT_BLUE,
              },
            ]}
            onPress={() => report('RN Pressable onPress')}>
            <Text style={styles.buttonText}>Press me</Text>
          </RNPressable>
        </Panel>

        <Panel
          title="Gesture Handler"
          accent={COLORS.DARK_GREEN}
          ScrollViewComponent={RNGHScrollView}
          mode={mode}>
          <RNGHTextInput
            style={styles.input}
            placeholder="GH input"
            placeholderTextColor={COLORS.GRAY}
          />
          <RNGHPressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? COLORS.KINDA_GREEN : COLORS.GREEN,
              },
            ]}
            onPress={() => report('GH Pressable onPress')}>
            <Text style={styles.buttonText}>Press me</Text>
          </RNGHPressable>
        </Panel>
      </View>

      <InfoSection description={MODE_DESCRIPTIONS[mode]} />

      <View style={styles.feedbackArea}>
        <Feedback ref={feedbackRef} duration={1500} />
      </View>
    </View>
  );
}

type ModeSelectorProps = {
  value: Mode;
  onChange: (next: Mode) => void;
};

function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <View style={styles.modeRow}>
      {MODES.map((m) => {
        const active = m === value;
        return (
          <RNPressable
            key={m}
            onPress={() => onChange(m)}
            style={[styles.modeChip, active && styles.modeChipActive]}>
            <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
              {m}
            </Text>
          </RNPressable>
        );
      })}
    </View>
  );
}

type PanelProps = {
  title: string;
  accent: string;
  mode: Mode;
  ScrollViewComponent: React.ComponentType<
    React.ComponentProps<typeof RNScrollView>
  >;
  children: React.ReactNode;
};

function Panel({
  title,
  accent,
  mode,
  ScrollViewComponent,
  children,
}: PanelProps) {
  return (
    <View style={[styles.panel, { borderColor: accent }]}>
      <View style={[styles.panelHeader, { backgroundColor: accent }]}>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      <ScrollViewComponent
        keyboardShouldPersistTaps={mode}
        contentContainerStyle={styles.panelBody}>
        {children}
      </ScrollViewComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.offWhite,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  modeRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 10,
    backgroundColor: COLORS.headerSeparator,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipActive: {
    backgroundColor: COLORS.NAVY,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.NAVY,
    fontFamily: 'Menlo',
  },
  modeLabelActive: {
    color: '#ffffff',
  },
  dismiss: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.PURPLE,
  },
  dismissText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  panelRow: {
    flexDirection: 'row',
    gap: 10,
    height: 200,
  },
  panel: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  panelHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  panelBody: {
    padding: 10,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackArea: {
    alignItems: 'center',
    minHeight: 30,
  },
});
