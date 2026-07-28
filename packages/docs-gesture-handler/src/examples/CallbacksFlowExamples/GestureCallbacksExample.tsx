import BrowserOnly from '@docusaurus/BrowserOnly';
import { useRef, useState } from 'react';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  ArrowMarkers,
  bracketLoopPath,
  CAUSAL_DELAY_MS,
  ChartNode,
  Edge,
  type NodeRect,
  type PulseColor,
  sideRailPath,
  useChartGeometry,
  usePulse,
} from './shared';
import styles from './styles.module.css';

const BALL_CLAMP_RADIUS = 70;
const SPRING_BACK = { damping: 14, stiffness: 220 };
const MARKER_ID_PREFIX = 'gesture-callbacks-arrow';

const NODES = [
  'onBegin',
  'onActivate',
  'onUpdate',
  'onDeactivate',
  'onFinalize',
] as const;
type GestureNode = (typeof NODES)[number];

const NODE_ROW: Record<GestureNode, number> = {
  onBegin: 1,
  onActivate: 3,
  onUpdate: 5,
  onDeactivate: 7,
  onFinalize: 9,
};

function buildGesturePaths(n: Record<GestureNode, NodeRect>) {
  const begin = n.onBegin;
  const activate = n.onActivate;
  const update = n.onUpdate;
  const deactivate = n.onDeactivate;
  const finalize = n.onFinalize;

  return {
    begin_activate: `M${begin.cx},${begin.bottom} L${activate.cx},${activate.top}`,
    activate_update: `M${activate.cx},${activate.bottom} L${update.cx},${update.top}`,
    update_update: bracketLoopPath(update),
    update_deactivate: `M${update.cx},${update.bottom} L${deactivate.cx},${deactivate.top}`,
    deactivate_finalize: `M${deactivate.cx},${deactivate.bottom} L${finalize.cx},${finalize.top}`,
    begin_finalize: sideRailPath(begin, finalize, 'left'),
    activate_deactivate: sideRailPath(activate, deactivate, 'right'),
  };
}

type GestureEdge = keyof ReturnType<typeof buildGesturePaths>;

const EDGES: GestureEdge[] = [
  'begin_activate',
  'activate_update',
  'update_update',
  'update_deactivate',
  'deactivate_finalize',
  'begin_finalize',
  'activate_deactivate',
];

// edges/nodes ending at onFinalize take the blue/red color of the outcome
const EDGE_COLOR: Record<GestureEdge, PulseColor | 'finalize'> = {
  begin_activate: 'green',
  activate_update: 'green',
  update_update: 'green',
  update_deactivate: 'green',
  deactivate_finalize: 'finalize',
  begin_finalize: 'finalize',
  activate_deactivate: 'green',
};

const NODE_COLOR: Record<GestureNode, PulseColor | 'finalize'> = {
  onBegin: 'blue',
  onActivate: 'green',
  onUpdate: 'green',
  onDeactivate: 'green',
  onFinalize: 'finalize',
};

function GestureCallbacksDiagram() {
  const { active, pulse, fire, later, resetPulses } = usePulse();
  const { wrapRef, setNodeRef, geometry } = useChartGeometry(
    NODES,
    buildGesturePaths
  );

  const [pressed, setPressed] = useState(false);
  const [finalizeOk, setFinalizeOk] = useState(true);
  const wasActive = useRef(false);
  const isFirstUpdate = useRef(false);

  const ballX = useSharedValue(0);
  const ballY = useSharedValue(0);

  const pan = usePanGesture({
    shouldCancelWhenOutside: true,
    minDistance: 5,
    onBegin: () => {
      setPressed(true);
      pulse('onBegin');
    },
    onActivate: () => {
      wasActive.current = true;
      isFirstUpdate.current = true;
      fire('begin_activate', 'onActivate');
    },
    onUpdate: (event) => {
      const distance = Math.hypot(event.translationX, event.translationY);
      const scale =
        distance > BALL_CLAMP_RADIUS ? BALL_CLAMP_RADIUS / distance : 1;
      ballX.value = event.translationX * scale;
      ballY.value = event.translationY * scale;

      if (isFirstUpdate.current) {
        isFirstUpdate.current = false;
        fire('activate_update', 'onUpdate');
      } else {
        fire('update_update', 'onUpdate');
      }
    },
    onDeactivate: () => {
      fire('update_deactivate', 'onDeactivate');
      pulse('activate_deactivate');
    },
    onFinalize: (event) => {
      setPressed(false);
      setFinalizeOk(!event.canceled);
      ballX.value = withSpring(0, SPRING_BACK);
      ballY.value = withSpring(0, SPRING_BACK);

      if (wasActive.current) {
        // let the onDeactivate pulse land first
        later(() => {
          fire('deactivate_finalize', 'onFinalize');
          pulse('begin_finalize');
        }, 2 * CAUSAL_DELAY_MS);
      } else {
        pulse('onFinalize');
        pulse('begin_finalize');
      }
      wasActive.current = false;
    },
  });

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  const finalizeColor: PulseColor = finalizeOk ? 'blue' : 'red';
  const resolveColor = (color: PulseColor | 'finalize'): PulseColor =>
    color === 'finalize' ? finalizeColor : color;

  const onReset = () => {
    resetPulses();
    setPressed(false);
    setFinalizeOk(true);
    wasActive.current = false;
    ballX.value = withSpring(0, SPRING_BACK);
    ballY.value = withSpring(0, SPRING_BACK);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.gestureChartWrap} ref={wrapRef}>
        {geometry && (
          <svg className={styles.arrowsOverlay} viewBox={geometry.viewBox}>
            <ArrowMarkers idPrefix={MARKER_ID_PREFIX} />
            {EDGES.map((edge) => (
              <Edge
                key={edge}
                d={geometry.paths[edge]}
                active={!!active[edge]}
                color={resolveColor(EDGE_COLOR[edge])}
                idPrefix={MARKER_ID_PREFIX}
              />
            ))}
          </svg>
        )}
        <div className={styles.gestureGrid}>
          {NODES.map((node) => (
            <ChartNode
              key={node}
              label={node}
              active={!!active[node]}
              color={resolveColor(NODE_COLOR[node])}
              gridRow={NODE_ROW[node]}
              gridColumn={1}
              nodeRef={setNodeRef(node)}
            />
          ))}
        </div>
      </div>

      <div className={styles.ballArea}>
        <GestureHandlerRootView>
          <GestureDetector gesture={pan}>
            {/* react-native-web drops oklch() colors in RN styles, so the
                gesture-handling Animated.View only moves and a plain div
                paints the ball */}
            <Animated.View style={ballAnimatedStyle}>
              <div
                className={`${styles.ball} ${pressed ? styles.ballPressed : ''}`}
              />
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

export default function GestureCallbacksExample() {
  return (
    <BrowserOnly fallback={<div style={{ minHeight: 560 }} />}>
      {() => <GestureCallbacksDiagram />}
    </BrowserOnly>
  );
}
