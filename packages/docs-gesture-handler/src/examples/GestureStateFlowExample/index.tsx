import BrowserOnly from '@docusaurus/BrowserOnly';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GestureDetector,
  GestureHandlerRootView,
  useCompetingGestures,
  useLongPressGesture,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import styles from './styles.module.css';

type FlowState =
  | 'undetermined'
  | 'began'
  | 'active'
  | 'end'
  | 'failed'
  | 'cancelled';

const COLORS = {
  amber: 'oklch(80% 0.14 85)',
  blue: 'oklch(66% 0.17 250)',
  green: 'oklch(68% 0.15 150)',
  red: 'oklch(65% 0.19 25)',
};

// [background, text] of a node highlighted as the current state
const NODE_HIGHLIGHT: Record<FlowState, [string, string]> = {
  undetermined: [COLORS.amber, 'oklch(20% 0.02 260)'],
  began: [COLORS.blue, 'white'],
  active: [COLORS.green, 'oklch(15% 0.02 150)'],
  end: [COLORS.blue, 'white'],
  failed: [COLORS.red, 'white'],
  cancelled: [COLORS.red, 'white'],
};

const BALL_CLAMP_RADIUS = 70;
const AUTO_RESET_MS = 1000;
const SPRING_BACK = { damping: 14, stiffness: 220 };

function StateNode({
  label,
  current,
}: {
  label: FlowState;
  current: FlowState;
}) {
  const isCurrent = label === current;
  const [background, color] = NODE_HIGHLIGHT[label];

  return (
    <div
      className={styles.node}
      style={
        isCurrent
          ? {
              background,
              borderColor: background,
              color,
              transform: 'scale(1.03)',
            }
          : undefined
      }>
      {label.toUpperCase()}
    </div>
  );
}

function StateColumn({
  title,
  current,
}: {
  title: string;
  current: FlowState;
}) {
  return (
    <div>
      <div className={styles.columnTitle}>{title}</div>
      <div className={styles.stateGrid}>
        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <StateNode label="undetermined" current={current} />
        </div>
        <div className={styles.arrow} style={{ gridColumn: 1, gridRow: 2 }}>
          ↓
        </div>
        <div style={{ gridColumn: 1, gridRow: 3 }}>
          <StateNode label="began" current={current} />
        </div>
        <div className={styles.arrow} style={{ gridColumn: 2, gridRow: 3 }}>
          →
        </div>
        <div style={{ gridColumn: 3, gridRow: 3 }}>
          <StateNode label="failed" current={current} />
        </div>
        <div className={styles.arrow} style={{ gridColumn: 1, gridRow: 4 }}>
          ↓
        </div>
        <div
          className={`${styles.arrow} ${styles.arrowDiagonal}`}
          style={{ gridColumn: 2, gridRow: 4 }}>
          ↘
        </div>
        <div style={{ gridColumn: 1, gridRow: 5 }}>
          <StateNode label="active" current={current} />
        </div>
        <div className={styles.arrow} style={{ gridColumn: 2, gridRow: 5 }}>
          →
        </div>
        <div style={{ gridColumn: 3, gridRow: 5 }}>
          <StateNode label="cancelled" current={current} />
        </div>
        <div className={styles.arrow} style={{ gridColumn: 1, gridRow: 6 }}>
          ↓
        </div>
        <div style={{ gridColumn: 1, gridRow: 7 }}>
          <StateNode label="end" current={current} />
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className={styles.legend}>
      {(
        [
          [COLORS.amber, 'start'],
          [COLORS.blue, 'began / end'],
          [COLORS.green, 'active'],
          [COLORS.red, 'failed / cancelled'],
        ] as const
      ).map(([color, label]) => (
        <div className={styles.legendItem} key={label}>
          <div className={styles.legendSwatch} style={{ background: color }} />
          <span className={styles.legendLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function StateFlowsDiagram() {
  const [panState, setPanState] = useState<FlowState>('undetermined');
  const [lpState, setLpState] = useState<FlowState>('undetermined');

  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panWasActive = useRef(false);
  const lpWasActive = useRef(false);

  const clearResetTimer = useCallback(() => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    resetTimer.current = setTimeout(() => {
      setPanState('undetermined');
      setLpState('undetermined');
    }, AUTO_RESET_MS);
  }, [clearResetTimer]);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const ballX = useSharedValue(0);
  const ballY = useSharedValue(0);

  const pan = usePanGesture({
    onBegin: () => {
      clearResetTimer();
      setPanState('began');
    },
    onActivate: () => {
      panWasActive.current = true;
      setPanState('active');
    },
    onUpdate: (event) => {
      // follow the pointer, clamped to a fixed radius from the origin
      const distance = Math.hypot(event.translationX, event.translationY);
      const scale =
        distance > BALL_CLAMP_RADIUS ? BALL_CLAMP_RADIUS / distance : 1;
      ballX.value = event.translationX * scale;
      ballY.value = event.translationY * scale;
    },
    onDeactivate: (event) => {
      if (!event.canceled) {
        setPanState('end');
      }
    },
    onFinalize: (event) => {
      if (event.canceled) {
        setPanState(panWasActive.current ? 'cancelled' : 'failed');
      }
      panWasActive.current = false;
      ballX.value = withSpring(0, SPRING_BACK);
      ballY.value = withSpring(0, SPRING_BACK);
      scheduleReset();
    },
  });

  const longPress = useLongPressGesture({
    onBegin: () => {
      clearResetTimer();
      setLpState('began');
    },
    onActivate: () => {
      lpWasActive.current = true;
      setLpState('active');
    },
    onDeactivate: (event) => {
      if (!event.canceled) {
        setLpState('end');
      }
    },
    onFinalize: (event) => {
      if (event.canceled) {
        setLpState(lpWasActive.current ? 'cancelled' : 'failed');
      }
      lpWasActive.current = false;
      scheduleReset();
    },
  });

  const gesture = useCompetingGestures(pan, longPress);

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  const onReset = () => {
    clearResetTimer();
    panWasActive.current = false;
    lpWasActive.current = false;
    setPanState('undetermined');
    setLpState('undetermined');
  };

  return (
    <div className={styles.panel}>
      <Legend />

      <div className={styles.columns}>
        <StateColumn title="usePanGesture" current={panState} />
        <div className={styles.longPressColumn}>
          <StateColumn title="useLongPressGesture" current={lpState} />
        </div>
      </div>

      <div className={styles.ballArea}>
        <GestureHandlerRootView>
          <GestureDetector gesture={gesture}>
            {/* react-native-web drops oklch() colors in RN styles, so the
                gesture-handling Animated.View only moves and a plain div
                paints the ball */}
            <Animated.View style={ballAnimatedStyle}>
              <div className={styles.ball} />
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
        <div className={styles.caption}>Drag or hold the circle</div>
      </div>

      <div className={styles.resetRow}>
        <button type="button" className={styles.resetButton} onClick={onReset}>
          reset ↺
        </button>
      </div>
    </div>
  );
}

export default function GestureStateFlowExample() {
  return (
    <BrowserOnly fallback={<div style={{ minHeight: 480 }} />}>
      {() => <StateFlowsDiagram />}
    </BrowserOnly>
  );
}
