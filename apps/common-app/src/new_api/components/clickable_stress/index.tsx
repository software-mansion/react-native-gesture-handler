import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BaseButton,
  BorderlessButton,
  Clickable,
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';

const COLORS = {
  PURPLE: '#7d63d9',
  NAVY: '#17327a',
  GREEN: '#167a5f',
  GRAY: '#7f879b',
  RED: '#b53645',
  BLUE: '#1067c4',
};

const STRESS_ITEM_COUNT = 2000;
const STRESS_RUN_COUNT = 20;
const STRESS_TRIM_COUNT = 2;

const STRESS_DATA = Array.from({ length: STRESS_ITEM_COUNT }, (_, index) => ({
  id: `stress-${index}`,
  label: `Button ${index + 1}`,
}));

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function getTrimmedStats(results: number[], trimCount: number) {
  if (results.length === 0) {
    return {
      average: null,
      trimmedAverage: null,
    };
  }

  const sortedResults = [...results].sort((left, right) => left - right);
  const safeTrimCount = Math.min(
    trimCount,
    Math.max(0, Math.floor((sortedResults.length - 1) / 2))
  );
  const trimmedResults =
    safeTrimCount > 0
      ? sortedResults.slice(safeTrimCount, sortedResults.length - safeTrimCount)
      : sortedResults;

  return {
    average: results.reduce((sum, value) => sum + value, 0) / results.length,
    trimmedAverage:
      trimmedResults.reduce((sum, value) => sum + value, 0) /
      trimmedResults.length,
  };
}

type ImplementationKey = 'reference' | 'clickable';
type ScenarioKey = 'base' | 'rect' | 'borderless';

type ScenarioResult = Record<ImplementationKey, number[]>;
type ResultsByScenario = Record<ScenarioKey, ScenarioResult>;
type StatusByScenario = Record<ScenarioKey, string>;

type StressScenario = {
  key: ScenarioKey;
  title: string;
  description: string;
  referenceName: string;
  clickableName: string;
  renderReference: (label: string, key: string) => React.ReactElement;
  renderClickable: (label: string, key: string) => React.ReactElement;
};

type ActiveBenchmark = {
  scenarioKey: ScenarioKey;
  implementationKey: ImplementationKey;
  runToken: number;
};

const INITIAL_RESULTS: ResultsByScenario = {
  base: { reference: [], clickable: [] },
  rect: { reference: [], clickable: [] },
  borderless: { reference: [], clickable: [] },
};

const INITIAL_STATUS: StatusByScenario = {
  base: `Ready to mount ${STRESS_ITEM_COUNT} buttons.`,
  rect: `Ready to mount ${STRESS_ITEM_COUNT} buttons.`,
  borderless: `Ready to mount ${STRESS_ITEM_COUNT} buttons.`,
};

const STRESS_SCENARIOS: StressScenario[] = [
  {
    key: 'base',
    title: 'BaseButton vs Clickable',
    description: 'Clickable with no visual feedback compared to BaseButton.',
    referenceName: 'BaseButton',
    clickableName: 'Clickable',
    renderReference: (label, key) => (
      <BaseButton key={key} style={styles.stressButton}>
        <Text style={styles.stressButtonText}>{label}</Text>
      </BaseButton>
    ),
    renderClickable: (label, key) => (
      <Clickable key={key} style={styles.stressButton}>
        <Text style={styles.stressButtonText}>{label}</Text>
      </Clickable>
    ),
  },
  {
    key: 'rect',
    title: 'RectButton vs Clickable',
    description:
      'Clickable configured with underlay opacity increase to match RectButton.',
    referenceName: 'RectButton',
    clickableName: 'Clickable (Rect)',
    renderReference: (label, key) => (
      <RectButton
        key={key}
        style={[styles.stressButton, styles.rectButton]}
        activeOpacity={0.105}
        underlayColor="black">
        <Text style={styles.stressButtonText}>{label}</Text>
      </RectButton>
    ),
    renderClickable: (label, key) => (
      <Clickable
        key={key}
        style={[styles.stressButton, styles.rectButton]}
        underlayActiveOpacity={0.105}
        underlayColor="black">
        <Text style={styles.stressButtonText}>{label}</Text>
      </Clickable>
    ),
  },
  {
    key: 'borderless',
    title: 'BorderlessButton vs Clickable',
    description:
      'Clickable configured with component opacity decrease to match BorderlessButton.',
    referenceName: 'BorderlessButton',
    clickableName: 'Clickable (Borderless)',
    renderReference: (label, key) => (
      <BorderlessButton
        key={key}
        style={[styles.stressButton, styles.borderlessButton]}
        activeOpacity={0.3}
        borderless>
        <Text style={styles.stressButtonText}>{label}</Text>
      </BorderlessButton>
    ),
    renderClickable: (label, key) => (
      <Clickable
        key={key}
        style={[styles.stressButton, styles.borderlessButton]}
        activeOpacity={0.3}
        androidRipple={{ borderless: true }}>
        <Text style={styles.stressButtonText}>{label}</Text>
      </Clickable>
    ),
  },
];

function getScenarioByKey(key: ScenarioKey) {
  const scenario = STRESS_SCENARIOS.find((item) => item.key === key);

  if (scenario === undefined) {
    throw new Error(`Unknown stress scenario: ${key}`);
  }

  return scenario;
}

type StressListProps = {
  benchmark: ActiveBenchmark;
  onReady: (runToken: number) => void;
};

function StressList({ benchmark, onReady }: StressListProps) {
  const scenario = getScenarioByKey(benchmark.scenarioKey);
  const renderButton =
    benchmark.implementationKey === 'reference'
      ? scenario.renderReference
      : scenario.renderClickable;

  return (
    <ScrollView
      style={styles.stressList}
      contentContainerStyle={styles.stressGrid}>
      {STRESS_DATA.map((item, index) => {
        const button = renderButton(item.label, item.id);

        if (index !== STRESS_DATA.length - 1) {
          return button;
        }

        return (
          <View key={item.id} onLayout={() => onReady(benchmark.runToken)}>
            {button}
          </View>
        );
      })}
    </ScrollView>
  );
}

export default function ClickableStressExample() {
  const [activeBenchmark, setActiveBenchmark] =
    useState<ActiveBenchmark | null>(null);
  const [resultsByScenario, setResultsByScenario] =
    useState<ResultsByScenario>(INITIAL_RESULTS);
  const [statusByScenario, setStatusByScenario] =
    useState<StatusByScenario>(INITIAL_STATUS);

  const runStartRef = useRef<number | null>(null);
  const lastCompletedTokenRef = useRef<number | null>(null);
  const activeBenchmarkRef = useRef<ActiveBenchmark | null>(null);
  const resultsRef = useRef<ResultsByScenario>(INITIAL_RESULTS);

  const scheduleRun = useCallback(
    (
      scenarioKey: ScenarioKey,
      implementationKey: ImplementationKey,
      runToken: number
    ) => {
      requestAnimationFrame(() => {
        runStartRef.current = now();
        lastCompletedTokenRef.current = null;
        const nextBenchmark = { scenarioKey, implementationKey, runToken };

        activeBenchmarkRef.current = nextBenchmark;
        setActiveBenchmark(nextBenchmark);
        setStatusByScenario((previousStatus) => ({
          ...previousStatus,
          [scenarioKey]: `${
            getScenarioByKey(scenarioKey)[
              implementationKey === 'reference'
                ? 'referenceName'
                : 'clickableName'
            ]
          } ${runToken}/${STRESS_RUN_COUNT}...`,
        }));
      });
    },
    []
  );

  const clearMountedList = useCallback((callback: () => void) => {
    activeBenchmarkRef.current = null;
    setActiveBenchmark(null);
    requestAnimationFrame(callback);
  }, []);

  const finalizeScenario = useCallback((scenarioKey: ScenarioKey) => {
    const scenario = getScenarioByKey(scenarioKey);
    const scenarioResults = resultsRef.current[scenarioKey];
    const referenceStats = getTrimmedStats(
      scenarioResults.reference,
      STRESS_TRIM_COUNT
    );
    const clickableStats = getTrimmedStats(
      scenarioResults.clickable,
      STRESS_TRIM_COUNT
    );

    activeBenchmarkRef.current = null;
    setActiveBenchmark(null);
    setStatusByScenario((previousStatus) => ({
      ...previousStatus,
      [scenarioKey]:
        referenceStats.trimmedAverage === null ||
        clickableStats.trimmedAverage === null
          ? 'Benchmark finished with no results.'
          : `${scenario.referenceName}: ${referenceStats.trimmedAverage.toFixed(
              2
            )} ms, ${scenario.clickableName}: ${clickableStats.trimmedAverage.toFixed(
              2
            )} ms`,
    }));
  }, []);

  const beginBenchmark = useCallback(
    (
      scenarioKey: ScenarioKey,
      implementationKey: ImplementationKey,
      runToken: number
    ) => {
      clearMountedList(() => {
        scheduleRun(scenarioKey, implementationKey, runToken);
      });
    },
    [clearMountedList, scheduleRun]
  );

  const handleListReady = useCallback(
    (runToken: number) => {
      const benchmark = activeBenchmarkRef.current;

      if (benchmark === null || runStartRef.current === null) {
        return;
      }

      if (lastCompletedTokenRef.current === runToken) {
        return;
      }

      lastCompletedTokenRef.current = runToken;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const runStart = runStartRef.current;
          if (runStart === null) {
            return;
          }

          const duration = now() - runStart;
          const nextScenarioResults = {
            ...resultsRef.current[benchmark.scenarioKey],
            [benchmark.implementationKey]: [
              ...resultsRef.current[benchmark.scenarioKey][
                benchmark.implementationKey
              ],
              duration,
            ],
          };
          const nextResultsByScenario = {
            ...resultsRef.current,
            [benchmark.scenarioKey]: nextScenarioResults,
          };

          resultsRef.current = nextResultsByScenario;
          setResultsByScenario(nextResultsByScenario);

          if (runToken < STRESS_RUN_COUNT) {
            beginBenchmark(
              benchmark.scenarioKey,
              benchmark.implementationKey,
              runToken + 1
            );
            return;
          }

          if (benchmark.implementationKey === 'reference') {
            beginBenchmark(benchmark.scenarioKey, 'clickable', 1);
            return;
          }

          finalizeScenario(benchmark.scenarioKey);
        });
      });
    },
    [beginBenchmark, finalizeScenario]
  );

  const startScenarioBenchmark = useCallback(
    (scenarioKey: ScenarioKey) => {
      if (activeBenchmarkRef.current !== null) {
        return;
      }

      runStartRef.current = null;
      lastCompletedTokenRef.current = null;
      const nextResults = {
        ...resultsRef.current,
        [scenarioKey]: {
          reference: [],
          clickable: [],
        },
      };

      resultsRef.current = nextResults;
      setResultsByScenario(nextResults);
      setStatusByScenario((previousStatus) => ({
        ...previousStatus,
        [scenarioKey]: `Preparing benchmark with ${STRESS_ITEM_COUNT} buttons...`,
      }));

      requestAnimationFrame(() => {
        scheduleRun(scenarioKey, 'reference', 1);
      });
    },
    [scheduleRun]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.screenHeader}>
            Buttons vs Clickable stress tests
          </Text>
          <Text style={styles.sectionDescription}>
            Each comparison mounts {STRESS_ITEM_COUNT} items for both the
            original button and the matching Clickable configuration, runs
            {` ${STRESS_RUN_COUNT} `}
            samples per side, and drops the {STRESS_TRIM_COUNT} fastest and
            slowest runs before averaging.
          </Text>
        </View>

        {STRESS_SCENARIOS.map((scenario) => {
          const scenarioResults = resultsByScenario[scenario.key];
          const referenceStats = getTrimmedStats(
            scenarioResults.reference,
            STRESS_TRIM_COUNT
          );
          const clickableStats = getTrimmedStats(
            scenarioResults.clickable,
            STRESS_TRIM_COUNT
          );
          const trimmedDelta =
            referenceStats.trimmedAverage !== null &&
            clickableStats.trimmedAverage !== null
              ? clickableStats.trimmedAverage - referenceStats.trimmedAverage
              : null;
          const isScenarioRunning =
            activeBenchmark?.scenarioKey === scenario.key;

          return (
            <View key={scenario.key} style={styles.section}>
              <Text style={styles.sectionHeader}>{scenario.title}</Text>
              <Text style={styles.sectionDescription}>
                {scenario.description}
              </Text>

              <Clickable
                style={[
                  styles.benchmarkButton,
                  activeBenchmark !== null && styles.benchmarkButtonBusy,
                ]}
                onPress={() => startScenarioBenchmark(scenario.key)}
                enabled={activeBenchmark === null}
                underlayActiveOpacity={0.2}
                underlayColor={COLORS.NAVY}>
                <Text style={styles.benchmarkButtonText}>
                  {isScenarioRunning
                    ? 'Benchmark running...'
                    : `Run ${scenario.title}`}
                </Text>
              </Clickable>

              <Text style={styles.benchmarkStatus}>
                {statusByScenario[scenario.key]}
              </Text>

              {(scenarioResults.reference.length > 0 ||
                scenarioResults.clickable.length > 0) && (
                <View style={styles.metricsCard}>
                  <Text style={styles.metricsHeadline}>Results</Text>
                  <Text style={styles.metricsText}>
                    {scenario.referenceName}:{' '}
                    {scenarioResults.reference
                      .map((value) => value.toFixed(1))
                      .join(', ') || '-'}{' '}
                    ms
                  </Text>
                  <Text style={styles.metricsText}>
                    {scenario.clickableName}:{' '}
                    {scenarioResults.clickable
                      .map((value) => value.toFixed(1))
                      .join(', ') || '-'}{' '}
                    ms
                  </Text>
                  <Text style={styles.metricsText}>
                    {scenario.referenceName} avg:{' '}
                    {referenceStats.average?.toFixed(2) ?? '-'} ms
                  </Text>
                  <Text style={styles.metricsText}>
                    {scenario.referenceName} trimmed avg:{' '}
                    {referenceStats.trimmedAverage?.toFixed(2) ?? '-'} ms
                  </Text>
                  <Text style={styles.metricsText}>
                    {scenario.clickableName} avg:{' '}
                    {clickableStats.average?.toFixed(2) ?? '-'} ms
                  </Text>
                  <Text style={styles.metricsText}>
                    {scenario.clickableName} trimmed avg:{' '}
                    {clickableStats.trimmedAverage?.toFixed(2) ?? '-'} ms
                  </Text>
                  <Text style={styles.metricsText}>
                    Trimmed delta:{' '}
                    {trimmedDelta === null
                      ? '-'
                      : `${trimmedDelta.toFixed(2)} ms`}
                  </Text>
                </View>
              )}

              {isScenarioRunning ? (
                <StressList
                  benchmark={activeBenchmark}
                  onReady={handleListReady}
                />
              ) : (
                <View style={styles.stressPlaceholder}>
                  <Text style={styles.stressPlaceholderText}>
                    Active benchmark list renders here while{' '}
                    {scenario.title.toLowerCase()} is running.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
    alignItems: 'center',
  },
  screenHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    textAlign: 'center',
    color: '#4a5368',
    marginTop: 4,
  },
  benchmarkButton: {
    width: 240,
    minHeight: 52,
    marginTop: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 16,
  },
  benchmarkButtonBusy: {
    backgroundColor: COLORS.GRAY,
  },
  benchmarkButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  benchmarkStatus: {
    marginTop: 12,
    textAlign: 'center',
    color: COLORS.NAVY,
    fontSize: 13,
  },
  metricsCard: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#eef3fb',
    padding: 16,
    gap: 8,
  },
  metricsHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.NAVY,
  },
  metricsText: {
    color: '#33415c',
    fontSize: 13,
  },
  stressList: {
    width: '100%',
    height: 320,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#f3f6fb',
  },
  stressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  stressButton: {
    width: 96,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PURPLE,
  },
  rectButton: {
    backgroundColor: COLORS.BLUE,
  },
  borderlessButton: {
    backgroundColor: COLORS.RED,
  },
  stressButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stressPlaceholder: {
    width: '100%',
    height: 120,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8dfec',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stressPlaceholderText: {
    textAlign: 'center',
    color: '#5b6478',
  },
});
