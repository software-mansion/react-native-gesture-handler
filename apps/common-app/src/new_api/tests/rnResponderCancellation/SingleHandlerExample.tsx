import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import {
  COLORS,
  Feedback,
  FeedbackHandle,
  commonStyles,
} from '../../../common';

const SINGLE_MAX_EVENTS = 8;

export function SingleHandlerExample() {
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
