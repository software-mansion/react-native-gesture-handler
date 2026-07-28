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
  gridRow,
  gridColumn,
  nodeRef,
}: {
  label: FlowState;
  current: FlowState;
  gridRow: number;
  gridColumn: number;
  nodeRef: (el: HTMLDivElement | null) => void;
}) {
  const isCurrent = label === current;
  const [background, color] = NODE_HIGHLIGHT[label];

  return (
    <div
      ref={nodeRef}
      className={styles.node}
      style={{
        gridRow,
        gridColumn,
        ...(isCurrent
          ? {
              background,
              borderColor: background,
              color,
              transform: 'scale(1.03)',
            }
          : undefined),
      }}>
      {label.toUpperCase()}
    </div>
  );
}

// [state, gridRow, gridColumn] — rows 2/4/6 are 28px spacers the arrows run through
const NODE_LAYOUT: [FlowState, number, number][] = [
  ['undetermined', 1, 1],
  ['began', 3, 1],
  ['failed', 3, 3],
  ['active', 5, 1],
  ['cancelled', 5, 3],
  ['end', 7, 1],
];

type NodeRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
};

function buildPaths(n: Record<FlowState, NodeRect>): string[] {
  return [
    `M${n.undetermined.cx},${n.undetermined.bottom} L${n.began.cx},${n.began.top}`,
    `M${n.began.right},${n.began.cy} L${n.failed.left},${n.failed.cy}`,
    `M${n.began.cx},${n.began.bottom} L${n.active.cx},${n.active.top}`,
    `M${n.began.right},${n.began.bottom} L${n.cancelled.left},${n.cancelled.top}`,
    `M${n.active.right},${n.active.cy} L${n.cancelled.left},${n.cancelled.cy}`,
    `M${n.active.cx},${n.active.bottom} L${n.end.cx},${n.end.top}`,
  ];
}

function StateColumn({
  title,
  current,
}: {
  title: string;
  current: FlowState;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Partial<Record<FlowState, HTMLDivElement>>>({});
  const [geometry, setGeometry] = useState<{
    paths: string[];
    viewBox: string;
  } | null>(null);

  const measureGeometry = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    if (wrapRect.width === 0) {
      // column is hidden (mobile layout)
      return;
    }

    const rects = {} as Record<FlowState, NodeRect>;
    for (const [state] of NODE_LAYOUT) {
      const el = nodeRefs.current[state];
      if (!el) {
        return;
      }
      const r = el.getBoundingClientRect();
      rects[state] = {
        left: r.left - wrapRect.left,
        right: r.right - wrapRect.left,
        top: r.top - wrapRect.top,
        bottom: r.bottom - wrapRect.top,
        cx: (r.left + r.right) / 2 - wrapRect.left,
        cy: (r.top + r.bottom) / 2 - wrapRect.top,
      };
    }

    // measuring DOM geometry can only happen after mount
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setGeometry({
      paths: buildPaths(rects),
      viewBox: `0 0 ${Math.round(wrapRect.width)} ${Math.round(wrapRect.height)}`,
    });
  }, []);

  useEffect(() => {
    measureGeometry();
    window.addEventListener('resize', measureGeometry);
    void document.fonts?.ready.then(measureGeometry);

    const resizeObserver = new ResizeObserver(measureGeometry);
    if (wrapRef.current) {
      resizeObserver.observe(wrapRef.current);
    }

    return () => {
      window.removeEventListener('resize', measureGeometry);
      resizeObserver.disconnect();
    };
  }, [measureGeometry]);

  const markerId = `arrowhead-${title}`;

  return (
    <div>
      <div className={styles.columnTitle}>{title}</div>
      <div className={styles.stateGridWrap} ref={wrapRef}>
        {geometry && (
          <svg className={styles.arrowsOverlay} viewBox={geometry.viewBox}>
            <defs>
              <marker
                id={markerId}
                markerUnits="userSpaceOnUse"
                markerWidth={9}
                markerHeight={9}
                refX={8}
                refY={4.5}
                orient="auto">
                <path d="M0,0 L8,4.5 L0,9 Z" className={styles.arrowHead} />
              </marker>
            </defs>
            {geometry.paths.map((d) => (
              <path
                key={d}
                d={d}
                className={styles.arrowLine}
                markerEnd={`url(#${markerId})`}
              />
            ))}
          </svg>
        )}
        <div className={styles.stateGrid}>
          {NODE_LAYOUT.map(([state, gridRow, gridColumn]) => (
            <StateNode
              key={state}
              label={state}
              current={current}
              gridRow={gridRow}
              gridColumn={gridColumn}
              nodeRef={(el) => {
                nodeRefs.current[state] = el ?? undefined;
              }}
            />
          ))}
        </div>
      </div>
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
    ballX.value = withSpring(0, SPRING_BACK);
    ballY.value = withSpring(0, SPRING_BACK);
  };

  return (
    <div className={styles.panel}>
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
