import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { COLORS, commonStyles } from '../../../common';

const MAX_EVENTS = 5;

type PanelProps = {
  title: string;
  preventRecognizers: boolean;
};

function EventPanel({ title, preventRecognizers }: PanelProps) {
  const sequenceRef = useRef(0);
  const [events, setEvents] = useState<string[]>([]);

  const pushEvent = (label: string) => {
    sequenceRef.current += 1;
    const event = `${sequenceRef.current}. ${label}`;
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
  };

  const panGesture = usePanGesture({
    minDistance: 12,
    runOnJS: true,
    onFinalize: () => {
      pushEvent('GH pan finalize');
    },
    onActivate: () => {
      pushEvent('GH pan ACTIVE');
    },
  });

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelSubtitle}>
        preventRecognizers={String(preventRecognizers)}
      </Text>
      <GestureDetector
        gesture={panGesture}
        preventRecognizers={preventRecognizers}>
        <View
          style={styles.touchArea}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={() => {
            pushEvent('RN grant');
          }}
          onResponderMove={() => {
            pushEvent('RN move');
          }}
          onResponderRelease={() => {
            pushEvent('RN release');
          }}
          onResponderTerminate={() => {
            pushEvent('RN terminate');
          }}
          onResponderTerminationRequest={() => true}>
          <Text style={styles.touchAreaLabel}>Drag here</Text>
        </View>
      </GestureDetector>
      <View style={styles.logContainer}>
        {events.map((event) => (
          <Text key={event} style={styles.logLine}>
            {event}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function RNResponderCancellationPerRootExample() {
  return (
    <View style={styles.container}>
      <Text style={commonStyles.header}>
        Per-detector responder cancellation
      </Text>
      <Text style={commonStyles.instructions}>
        Compare both sections. Top should terminate RN responder after GH
        activates, bottom should keep RN callbacks running.
      </Text>
      <EventPanel title="Detector A" preventRecognizers />
      <EventPanel title="Detector B" preventRecognizers={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
    backgroundColor: COLORS.offWhite,
  },
  panelContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd8ea',
    padding: 10,
    backgroundColor: '#fdfefe',
    gap: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.NAVY,
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#495868',
  },
  touchArea: {
    minHeight: 120,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: COLORS.NAVY,
    backgroundColor: '#d8ebff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchAreaLabel: {
    color: COLORS.NAVY,
    fontWeight: '700',
  },
  logContainer: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#d5dbe6',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  logLine: {
    fontSize: 12,
    color: '#2c3a4f',
    fontFamily: 'Courier',
  },
});
