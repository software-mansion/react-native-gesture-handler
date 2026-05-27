import { Profiler, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView, Touchable } from 'react-native-gesture-handler';

const CLICK_COUNT = 2000;
const N = 25;
const DROPOUT = 3;

const STRESS_DATA = Array.from(
  { length: CLICK_COUNT },
  (_, i) => `stress-${i}`
);

type BenchmarkState =
  | { phase: 'idle' }
  | { phase: 'running'; run: number }
  | { phase: 'done'; results: number[] };

function getTrimmedAverage(results: number[], dropout: number): number {
  const sorted = [...results].sort((a, b) => a - b);
  const trimCount = Math.min(
    dropout,
    Math.max(0, Math.floor((sorted.length - 1) / 2))
  );
  const trimmed =
    trimCount > 0 ? sorted.slice(trimCount, sorted.length - trimCount) : sorted;
  return trimmed.reduce((sum, v) => sum + v, 0) / trimmed.length;
}

type TouchableListProps = {
  run: number;
  onMountDuration: (duration: number) => void;
};

function TouchableList({ run, onMountDuration }: TouchableListProps) {
  const reportedRef = useRef(-1);

  const handleRender = useCallback(
    (_id: string, phase: string, actualDuration: number) => {
      if (phase === 'mount' && reportedRef.current !== run) {
        reportedRef.current = run;
        onMountDuration(actualDuration);
      }
    },
    [run, onMountDuration]
  );

  return (
    <Profiler id="TouchableList" onRender={handleRender}>
      <ScrollView style={{ flex: 1 }}>
        {STRESS_DATA.map((id) => (
          // <BaseButton key={id} style={styles.button} />
          <Touchable key={id} style={styles.button} />

          // <RectButton key={id} style={styles.button} />
          // <Touchable
          //   key={id}
          //   style={styles.button}
          //   activeUnderlayOpacity={0.105}
          // />

          // <BorderlessButton key={id} style={styles.button} />
          // <Touchable key={id} style={styles.button} activeOpacity={0.3} />
        ))}
      </ScrollView>
    </Profiler>
  );
}

export default function TouchableStress() {
  const [state, setState] = useState<BenchmarkState>({ phase: 'idle' });
  const resultsRef = useRef<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    resultsRef.current = [];
    setState({ phase: 'running', run: 1 });
  }, []);

  const handleMountDuration = useCallback((duration: number) => {
    resultsRef.current = [...resultsRef.current, duration];
    const currentRun = resultsRef.current.length;

    if (currentRun >= N) {
      setState({ phase: 'done', results: resultsRef.current });
      return;
    }

    // Unmount then remount for next run
    setState({ phase: 'idle' });
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setState({ phase: 'running', run: currentRun + 1 });
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const isRunning = state.phase === 'running';
  const currentRun = state.phase === 'running' ? state.run : 0;
  const results = state.phase === 'done' ? state.results : null;
  const trimmedAverage = results ? getTrimmedAverage(results, DROPOUT) : null;

  return (
    <View style={styles.container}>
      <Touchable
        activeUnderlayOpacity={0.105}
        style={[styles.startButton, isRunning && styles.startButtonBusy]}
        onPress={start}
        disabled={isRunning}>
        <Text style={styles.startButtonText}>
          {isRunning ? `Running ${currentRun}/${N}...` : 'Start test'}
        </Text>
      </Touchable>

      {results && (
        <View style={styles.results}>
          <Text style={styles.resultText}>
            Runs: {results.length} (trimmed ±{DROPOUT})
          </Text>
          <Text style={styles.resultText}>
            Trimmed avg: {trimmedAverage?.toFixed(2)} ms
          </Text>
          <Text style={styles.resultText}>
            Min: {Math.min(...results).toFixed(2)} ms
          </Text>
          <Text style={styles.resultText}>
            Max: {Math.max(...results).toFixed(2)} ms
          </Text>
          <Text style={styles.resultText}>
            All: {results.map((r) => r.toFixed(1)).join(', ')} ms
          </Text>
        </View>
      )}

      {isRunning && (
        <TouchableList run={currentRun} onMountDuration={handleMountDuration} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  startButton: {
    width: 200,
    height: 50,
    backgroundColor: '#167a5f',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonBusy: {
    backgroundColor: '#7f879b',
  },
  startButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  button: {
    width: 200,
    height: 50,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eef3fb',
    width: '100%',
    gap: 6,
  },
  resultText: {
    color: '#33415c',
    fontSize: 13,
  },
});
