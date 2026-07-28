import BrowserOnly from '@docusaurus/BrowserOnly';
import { useRef, useState } from 'react';
import {
  GestureDetector,
  GestureHandlerRootView,
  GestureStateManager,
  useManualGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  ArrowMarkers,
  bracketLoopPath,
  ChartNode,
  Edge,
  type NodeRect,
  type PulseColor,
  useChartGeometry,
  usePulse,
} from './shared';
import styles from './styles.module.css';

const BALL_CLAMP_RADIUS = 70;
const SPRING_BACK = { damping: 14, stiffness: 220 };
const MARKER_ID_PREFIX = 'touch-callbacks-arrow';

const NODES = [
  'onTouchesDown',
  'onTouchesMove',
  'onTouchesUp',
  'onTouchesCancel',
] as const;
type TouchNode = (typeof NODES)[number];

// DOWN and MOVE are centered over the full grid width; UP and CANCEL split
// the bottom row, so the MOVE arrows fan out symmetrically
const NODE_POSITION: Record<
  TouchNode,
  { row: number; column: number | string; centered?: boolean }
> = {
  onTouchesDown: { row: 1, column: '1 / -1', centered: true },
  onTouchesMove: { row: 3, column: '1 / -1', centered: true },
  onTouchesUp: { row: 5, column: 1 },
  onTouchesCancel: { row: 5, column: 3 },
};

// where the skip-move arrows land on the target's top edge, measured from
// its center (outward), and how round their single 90° turn is
const SKIP_LAND_OFFSET = 40;
const CORNER_RADIUS = 24;

function buildTouchPaths(n: Record<TouchNode, NodeRect>) {
  const down = n.onTouchesDown;
  const move = n.onTouchesMove;
  const up = n.onTouchesUp;
  const cancel = n.onTouchesCancel;

  return {
    down_move: `M${down.cx},${down.bottom} L${move.cx},${move.top}`,
    move_move: bracketLoopPath(move),
    move_up: `M${move.cx - 24},${move.bottom} L${up.cx},${up.top}`,
    move_cancel: `M${move.cx + 24},${move.bottom} L${cancel.cx},${cancel.top}`,
    // the skip-move arrows leave DOWN horizontally, take one smooth 90°
    // turn, and drop straight down onto the top edge of the target node
    down_up: `M${down.left},${down.cy} L${up.cx - SKIP_LAND_OFFSET + CORNER_RADIUS},${down.cy} Q${up.cx - SKIP_LAND_OFFSET},${down.cy} ${up.cx - SKIP_LAND_OFFSET},${down.cy + CORNER_RADIUS} L${up.cx - SKIP_LAND_OFFSET},${up.top}`,
    down_cancel: `M${down.right},${down.cy} L${cancel.cx + SKIP_LAND_OFFSET - CORNER_RADIUS},${down.cy} Q${cancel.cx + SKIP_LAND_OFFSET},${down.cy} ${cancel.cx + SKIP_LAND_OFFSET},${down.cy + CORNER_RADIUS} L${cancel.cx + SKIP_LAND_OFFSET},${cancel.top}`,
  };
}

type TouchEdge = keyof ReturnType<typeof buildTouchPaths>;

const EDGES: TouchEdge[] = [
  'down_move',
  'move_move',
  'move_up',
  'move_cancel',
  'down_up',
  'down_cancel',
];

const EDGE_COLOR: Record<TouchEdge, PulseColor> = {
  down_move: 'green',
  move_move: 'green',
  move_up: 'blue',
  move_cancel: 'red',
  down_up: 'blue',
  down_cancel: 'red',
};

const NODE_COLOR: Record<TouchNode, PulseColor> = {
  onTouchesDown: 'blue',
  onTouchesMove: 'green',
  onTouchesUp: 'blue',
  onTouchesCancel: 'red',
};

function TouchCallbacksDiagram() {
  const { active, pulse, fire, resetPulses } = usePulse();
  const { wrapRef, setNodeRef, geometry } = useChartGeometry(
    NODES,
    buildTouchPaths
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState(false);
  const startPoint = useRef<{ id: number; x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const ballX = useSharedValue(0);
  const ballY = useSharedValue(0);

  const endInteraction = () => {
    setPressed(false);
    startPoint.current = null;
    ballX.value = withSpring(0, SPRING_BACK);
    ballY.value = withSpring(0, SPRING_BACK);
  };

  const manual = useManualGesture({
    onTouchesDown: (event) => {
      setPressed(true);
      pulse('onTouchesDown');

      // don't rely on the order of `changedTouches`/`allTouches` — remember
      // the id of the touch we follow and look it up on every event
      if (!startPoint.current) {
        const touch = event.changedTouches[0];
        startPoint.current = {
          id: touch.id,
          x: touch.absoluteX,
          y: touch.absoluteY,
        };
        hasMoved.current = false;
      }
    },
    onTouchesMove: (event) => {
      if (hasMoved.current) {
        fire('move_move', 'onTouchesMove');
      } else {
        hasMoved.current = true;
        fire('down_move', 'onTouchesMove');
      }

      const origin = startPoint.current;
      const touch = origin
        ? event.allTouches.find((t) => t.id === origin.id)
        : undefined;
      if (!origin || !touch) {
        return;
      }

      const dx = touch.absoluteX - origin.x;
      const dy = touch.absoluteY - origin.y;
      const distance = Math.hypot(dx, dy);
      const scale =
        distance > BALL_CLAMP_RADIUS ? BALL_CLAMP_RADIUS / distance : 1;
      ballX.value = dx * scale;
      ballY.value = dy * scale;

      if (hasMoved.current) {
        fire('move_move', 'onTouchesMove');
      } else {
        hasMoved.current = true;
        fire('down_move', 'onTouchesMove');
      }

      // dragging out of the card fails the gesture, which cancels its
      // touches — so onTouchesCancel below fires with a real event
      const panel = panelRef.current?.getBoundingClientRect();
      if (
        panel &&
        (touch.absoluteX < panel.left ||
          touch.absoluteX > panel.right ||
          touch.absoluteY < panel.top ||
          touch.absoluteY > panel.bottom)
      ) {
        GestureStateManager.fail(event.handlerTag);
      }
    },
    onTouchesUp: () => {
      fire(hasMoved.current ? 'move_up' : 'down_up', 'onTouchesUp');
      endInteraction();
    },
    onTouchesCancel: () => {
      fire(hasMoved.current ? 'move_cancel' : 'down_cancel', 'onTouchesCancel');
      endInteraction();
    },
  });

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  const onReset = () => {
    resetPulses();
    endInteraction();
  };

  return (
    <div className={styles.panel} ref={panelRef}>
      <div className={styles.touchChartWrap} ref={wrapRef}>
        {geometry && (
          <svg className={styles.arrowsOverlay} viewBox={geometry.viewBox}>
            <ArrowMarkers idPrefix={MARKER_ID_PREFIX} />
            {EDGES.map((edge) => (
              <Edge
                key={edge}
                d={geometry.paths[edge]}
                active={!!active[edge]}
                color={EDGE_COLOR[edge]}
                idPrefix={MARKER_ID_PREFIX}
              />
            ))}
          </svg>
        )}
        <div className={styles.touchGrid}>
          {NODES.map((node) => (
            <ChartNode
              key={node}
              label={node}
              active={!!active[node]}
              color={NODE_COLOR[node]}
              gridRow={NODE_POSITION[node].row}
              gridColumn={NODE_POSITION[node].column}
              centered={NODE_POSITION[node].centered}
              nodeRef={setNodeRef(node)}
            />
          ))}
        </div>
      </div>

      <div className={styles.ballArea}>
        <GestureHandlerRootView>
          <GestureDetector gesture={manual}>
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
        <div className={styles.caption}>
          Drag or hold the circle — leave the card to cancel
        </div>
      </div>

      <div className={styles.resetRow}>
        <button type="button" className={styles.resetButton} onClick={onReset}>
          reset ↺
        </button>
      </div>
    </div>
  );
}

export default function TouchCallbacksExample() {
  return (
    <BrowserOnly fallback={<div style={{ minHeight: 460 }} />}>
      {() => <TouchCallbacksDiagram />}
    </BrowserOnly>
  );
}
