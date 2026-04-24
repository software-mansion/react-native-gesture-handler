import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import {
  COLORS,
  Feedback,
  FeedbackHandle,
  commonStyles,
} from '../../../common';

const SECTION_MIN_HEIGHT = 640;

export default function RNResponderCancellationExample() {
  return (
    <ScrollView
      style={scrollStyles.scroll}
      contentContainerStyle={scrollStyles.content}
      showsVerticalScrollIndicator>
      <View style={scrollStyles.section}>
        <SingleHandlerExample />
      </View>
      <View style={scrollStyles.divider} />
      <View style={scrollStyles.section}>
        <MultiHandlerExample />
      </View>
    </ScrollView>
  );
}

const scrollStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  section: {
    minHeight: SECTION_MIN_HEIGHT,
  },
  divider: {
    height: 2,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#b6bfd0',
  },
});

// ---------- Single handler --------------------------------------------------

const SINGLE_MAX_EVENTS = 8;

function SingleHandlerExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);
  const sequenceRef = useRef(0);
  const [events, setEvents] = useState<string[]>([]);
  const [cancelsJSResponder, setCancelsJSResponder] = useState(true);

  const pushEvent = useCallback((label: string) => {
    sequenceRef.current += 1;
    const event = `${sequenceRef.current}. ${label}`;

    console.log(event);
    feedbackRef.current?.showMessage(label);
    setEvents((prev) => [event, ...prev].slice(0, SINGLE_MAX_EVENTS));
  }, []);

  const panGesture = usePanGesture({
    minDistance: 12,
    runOnJS: true,
    cancelsJSResponder,
    onActivate: () => {
      pushEvent('GH pan ACTIVE');
    },
    onFinalize: (_event, success) => {
      pushEvent(`GH pan finalize (${success ? 'success' : 'cancel/fail'})`);
    },
  });

  return (
    <View style={singleStyles.container}>
      <Text style={commonStyles.header}>RN responder cancellation</Text>
      <Text style={commonStyles.instructions}>
        Toggle cancelsJSResponder and drag inside the box to compare behavior.
      </Text>
      <View style={singleStyles.settingsRow}>
        <Text style={singleStyles.settingsLabel}>cancelsJSResponder</Text>
        <Switch
          value={cancelsJSResponder}
          onValueChange={setCancelsJSResponder}
        />
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={singleStyles.touchArea}
          onStartShouldSetResponder={() => {
            pushEvent('RN onStartShouldSetResponder -> true');
            return true;
          }}
          onMoveShouldSetResponder={() => {
            pushEvent('RN onMoveShouldSetResponder -> true');
            return true;
          }}
          onResponderGrant={() => {
            pushEvent('RN onResponderGrant');
          }}
          onResponderMove={() => {
            pushEvent('RN onResponderMove');
          }}
          onResponderRelease={() => {
            pushEvent('RN onResponderRelease');
          }}
          onResponderTerminate={() => {
            pushEvent('RN onResponderTerminate');
          }}
          onResponderTerminationRequest={() => {
            pushEvent('RN onResponderTerminationRequest -> true');
            return true;
          }}>
          <Text style={singleStyles.touchAreaLabel}>Drag me</Text>
        </View>
      </GestureDetector>

      <Feedback ref={feedbackRef} duration={1300} />
      <View style={singleStyles.logContainer}>
        {events.map((item) => (
          <Text
            key={item}
            style={[
              singleStyles.logLine,
              item.includes('GH pan ACTIVE') && singleStyles.logLineActive,
            ]}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

const singleStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  touchArea: {
    width: '100%',
    maxWidth: 340,
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.NAVY,
    backgroundColor: '#d8ebff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchAreaLabel: {
    color: COLORS.NAVY,
    fontWeight: '700',
    fontSize: 18,
  },
  settingsRow: {
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLabel: {
    color: COLORS.NAVY,
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    width: '100%',
    maxWidth: 380,
    minHeight: 170,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbe6',
    gap: 2,
  },
  logLine: {
    fontSize: 13,
    color: '#2c3a4f',
    fontFamily: 'Courier',
  },
  logLineActive: {
    color: '#1565c0',
    fontWeight: 'bold',
  },
});

// ---------- Multi handler ---------------------------------------------------
// Validates that when two Gesture Handler recognizers are active at the same
// time, both with cancelsJSResponder set to true, finishing ONE of them does
// NOT unblock React Native JS responders — the block must stay in place until
// the LAST cancelling recognizer finishes.
//
// Expected interaction to reproduce:
//   1. Finger 1: drag inside "Pan A"           → GH_A ACTIVE  (RN blocked)
//   2. Finger 2: drag inside "Pan B"           → GH_B ACTIVE
//   3. Finger 3: tap the "RN responder zone"   → grant must NOT fire
//   4. Release finger 1                        → GH_A finalize
//   5. Finger 3: tap the "RN responder zone"   → grant must STILL NOT fire
//                                                (GH_B is still active)
//   6. Release finger 2                        → GH_B finalize (released)
//   7. Finger 3: tap the "RN responder zone"   → grant SHOULD now fire
//
// If step 5 logs "RN zone onResponderGrant" the invariant is broken.

const MULTI_MAX_EVENTS = 14;

function MultiHandlerExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);
  const sequenceRef = useRef(0);
  const [events, setEvents] = useState<string[]>([]);
  const [cancelsJSResponder, setCancelsJSResponder] = useState(true);

  const pushEvent = useCallback((label: string) => {
    sequenceRef.current += 1;
    const event = `${sequenceRef.current}. ${label}`;

    console.log(event);
    feedbackRef.current?.showMessage(label);
    setEvents((prev) => [event, ...prev].slice(0, MULTI_MAX_EVENTS));
  }, []);

  const panA = usePanGesture({
    minDistance: 8,
    runOnJS: true,
    cancelsJSResponder,
    onActivate: () => pushEvent('GH_A ACTIVE'),
    onFinalize: (_e, success) =>
      pushEvent(`GH_A finalize (${success ? 'success' : 'cancel/fail'})`),
  });

  const panB = usePanGesture({
    minDistance: 8,
    runOnJS: true,
    cancelsJSResponder,
    onActivate: () => pushEvent('GH_B ACTIVE'),
    onFinalize: (_e, success) =>
      pushEvent(`GH_B finalize (${success ? 'success' : 'cancel/fail'})`),
  });

  const clearLog = useCallback(() => {
    sequenceRef.current = 0;
    setEvents([]);
  }, []);

  return (
    <View style={multiStyles.container}>
      <Text style={commonStyles.header}>cancelsJSResponder — multi</Text>
      <Text style={commonStyles.instructions}>
        Drag A and B with two fingers simultaneously, then tap the RN zone with
        a third finger. Release one finger at a time and re-tap.
      </Text>

      <View style={multiStyles.settingsRow}>
        <Text style={multiStyles.settingsLabel}>cancelsJSResponder</Text>
        <Switch
          value={cancelsJSResponder}
          onValueChange={setCancelsJSResponder}
        />
        <Text onPress={clearLog} style={multiStyles.clearButton}>
          clear
        </Text>
      </View>

      <View style={multiStyles.boxesRow}>
        <GestureDetector gesture={panA}>
          <View style={[multiStyles.panBox, multiStyles.panBoxA]}>
            <Text style={multiStyles.panLabel}>Pan A</Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={panB}>
          <View style={[multiStyles.panBox, multiStyles.panBoxB]}>
            <Text style={multiStyles.panLabel}>Pan B</Text>
          </View>
        </GestureDetector>
      </View>

      <View
        style={multiStyles.rnZone}
        onStartShouldSetResponder={() => {
          pushEvent('RN zone onStartShouldSetResponder -> true');
          return true;
        }}
        onResponderGrant={() => {
          pushEvent(
            'RN zone onResponderGrant   <-- NOT expected while GH active'
          );
        }}
        onResponderRelease={() => pushEvent('RN zone onResponderRelease')}
        onResponderTerminate={() =>
          pushEvent('RN zone onResponderTerminate  <-- cancelled by GH')
        }
        onResponderTerminationRequest={() => {
          pushEvent('RN zone onResponderTerminationRequest -> true');
          return true;
        }}>
        <Text style={multiStyles.rnZoneLabel}>RN responder zone (tap me)</Text>
      </View>

      <View style={multiStyles.feedbackSlot}>
        <Feedback ref={feedbackRef} duration={1200} />
      </View>
      <View style={multiStyles.logContainer}>
        {events.map((item) => (
          <Text
            key={item}
            style={[
              multiStyles.logLine,
              item.includes('ACTIVE') && multiStyles.logLineActive,
              item.includes('onResponderGrant') && multiStyles.logLineBad,
              item.includes('Terminate') && multiStyles.logLineCancel,
            ]}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

const multiStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  settingsRow: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLabel: {
    color: COLORS.NAVY,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    color: COLORS.NAVY,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.NAVY,
  },
  boxesRow: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  panBox: {
    flex: 1,
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panBoxA: { backgroundColor: '#d8ebff' },
  panBoxB: { backgroundColor: '#ffe0d8' },
  panLabel: {
    color: COLORS.NAVY,
    fontWeight: '700',
    fontSize: 16,
  },
  rnZone: {
    width: '100%',
    maxWidth: 380,
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7a4dff',
    backgroundColor: '#ece2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rnZoneLabel: {
    color: '#3a1f9c',
    fontWeight: '700',
    fontSize: 15,
  },
  feedbackSlot: {
    width: '100%',
    maxWidth: 420,
    height: 84,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logContainer: {
    width: '100%',
    maxWidth: 420,
    height: 260,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbe6',
    gap: 2,
    overflow: 'hidden',
  },
  logLine: {
    fontSize: 12,
    color: '#2c3a4f',
    fontFamily: 'Courier',
  },
  logLineActive: { color: '#1565c0', fontWeight: 'bold' },
  logLineBad: { color: '#b71c1c', fontWeight: 'bold' },
  logLineCancel: { color: '#6a1b9a' },
});
