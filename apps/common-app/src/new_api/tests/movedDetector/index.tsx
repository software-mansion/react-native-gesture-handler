import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { COLORS, useIndexedLogger } from '../../../common';

// Grabbing a row moves it to the top while its pan is active, the way a
// drag-to-reorder list moves a held row. Fabric moves the row's view by
// removing it and adding it back, so the detector is off the window for a
// moment. The pan must stay active through that and end only on release: the
// status reads "ended", not "cancelled".

type RowData = { id: string; color: string };

const INITIAL_ROWS: RowData[] = [
  { id: 'A', color: COLORS.NAVY },
  { id: 'B', color: COLORS.RED },
  { id: 'C', color: COLORS.GREEN },
  { id: 'D', color: COLORS.PURPLE },
];

type RowProps = RowData & {
  onGrab: (id: string) => void;
  onRelease: (canceled: boolean) => void;
  log: (message: string) => void;
};

function Row({ id, color, onGrab, onRelease, log }: RowProps) {
  const pan = usePanGesture({
    runOnJS: true,
    onActivate: () => {
      log(`${id}: onActivate`);
      onGrab(id);
    },
    onDeactivate: (event) => {
      log(`${id}: onDeactivate, canceled: ${event.canceled}`);
      onRelease(event.canceled);
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <View
        testID={`row-${id}`}
        style={[styles.row, { backgroundColor: color }]}>
        <Text style={styles.rowText}>Drag row {id}</Text>
      </View>
    </GestureDetector>
  );
}

export default function MovedDetectorExample() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [status, setStatus] = useState('idle');
  const log = useIndexedLogger();

  const onGrab = (id: string) => {
    setStatus('active');
    setRows((current) => [
      ...current.filter((row) => row.id === id),
      ...current.filter((row) => row.id !== id),
    ]);
  };

  const onRelease = (canceled: boolean) => {
    setStatus(canceled ? 'cancelled' : 'ended');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Drag any row but the top one and keep moving. It moves to the top as the
        pan starts. When you let go, the status must read &quot;ended&quot;, not
        &quot;cancelled&quot;.
      </Text>
      <Text testID="status" style={styles.status}>
        Pan: {status}
      </Text>
      {rows.map((row) => (
        <Row
          key={row.id}
          {...row}
          onGrab={onGrab}
          onRelease={onRelease}
          log={log}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  hint: {
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  row: {
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    color: 'white',
    fontSize: 16,
  },
});
