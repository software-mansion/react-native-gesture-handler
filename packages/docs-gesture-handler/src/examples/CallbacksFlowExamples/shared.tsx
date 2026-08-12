import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

export const COLORS = {
  blue: 'oklch(66% 0.17 250)',
  green: 'oklch(68% 0.15 150)',
  red: 'oklch(65% 0.19 25)',
} as const;

export type PulseColor = keyof typeof COLORS;

export const PULSE_MS = 450;
export const CAUSAL_DELAY_MS = 140;

// Tracks which nodes/edges of a chart are momentarily lit. Every pulse decays
// after PULSE_MS; `fire` lights an edge and its destination node one causal
// step apart so the flow direction reads visually.
export function usePulse() {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const pulseTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const delayTimers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const pulse = useCallback((name: string) => {
    const existing = pulseTimers.current.get(name);
    if (existing) {
      clearTimeout(existing);
    }
    setActive((current) => ({ ...current, [name]: true }));
    pulseTimers.current.set(
      name,
      setTimeout(() => {
        setActive((current) => {
          const next = { ...current };
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete next[name];
          return next;
        });
      }, PULSE_MS)
    );
  }, []);

  const later = useCallback((callback: () => void, delayMs: number) => {
    const timer = setTimeout(() => {
      delayTimers.current.delete(timer);
      callback();
    }, delayMs);
    delayTimers.current.add(timer);
  }, []);

  const fire = useCallback(
    (edge: string, node: string) => {
      pulse(edge);
      later(() => pulse(node), CAUSAL_DELAY_MS);
    },
    [pulse, later]
  );

  const resetPulses = useCallback(() => {
    pulseTimers.current.forEach(clearTimeout);
    pulseTimers.current.clear();
    delayTimers.current.forEach(clearTimeout);
    delayTimers.current.clear();
    setActive({});
  }, []);

  useEffect(() => resetPulses, [resetPulses]);

  return { active, pulse, fire, later, resetPulses };
}

export type NodeRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
};

// Measures the chart nodes relative to the wrapper and derives the SVG edge
// paths from their actual positions, re-measuring on resize and font load.
export function useChartGeometry<TNode extends string, TEdge extends string>(
  nodeKeys: readonly TNode[],
  buildPaths: (rects: Record<TNode, NodeRect>) => Record<TEdge, string>
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Partial<Record<TNode, HTMLDivElement>>>({});
  const [geometry, setGeometry] = useState<{
    paths: Record<TEdge, string>;
    viewBox: string;
  } | null>(null);

  const measureGeometry = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    if (wrapRect.width === 0) {
      return;
    }

    const rects = {} as Record<TNode, NodeRect>;
    for (const key of nodeKeys) {
      const el = nodeRefs.current[key];
      if (!el) {
        return;
      }
      const r = el.getBoundingClientRect();
      rects[key] = {
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
  }, [nodeKeys, buildPaths]);

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

  const setNodeRef = useCallback(
    (key: TNode) => (el: HTMLDivElement | null) => {
      nodeRefs.current[key] = el ?? undefined;
    },
    []
  );

  return { wrapRef, setNodeRef, geometry };
}

// Orthogonal path helpers — every routed arrow is straight lines joined by
// smooth 90° corners.

// self-loop: leaves the node's right edge, runs a rounded bracket outside,
// and comes back into the same edge
export function bracketLoopPath(
  rect: NodeRect,
  extent = 36,
  radius = 14
): string {
  const yTop = rect.cy - 14;
  const yBottom = rect.cy + 14;
  const railX = rect.right + extent;
  return (
    `M${rect.right},${yTop} L${railX - radius},${yTop} ` +
    `Q${railX},${yTop} ${railX},${yTop + radius} ` +
    `L${railX},${yBottom - radius} ` +
    `Q${railX},${yBottom} ${railX - radius},${yBottom} ` +
    `L${rect.right},${yBottom}`
  );
}

// skip connection: leaves `from` horizontally, turns 90° onto a vertical
// rail beside the chart, and turns 90° again to enter `to` horizontally
export function sideRailPath(
  from: NodeRect,
  to: NodeRect,
  side: 'left' | 'right',
  extent = 48,
  radius = 24
): string {
  const sign = side === 'left' ? -1 : 1;
  const fromX = side === 'left' ? from.left : from.right;
  const toX = side === 'left' ? to.left : to.right;
  const railX = fromX + sign * extent;
  return (
    `M${fromX},${from.cy} L${railX - sign * radius},${from.cy} ` +
    `Q${railX},${from.cy} ${railX},${from.cy + radius} ` +
    `L${railX},${to.cy - radius} ` +
    `Q${railX},${to.cy} ${railX - sign * radius},${to.cy} ` +
    `L${toX},${to.cy}`
  );
}

const MARKER_PROPS = {
  markerUnits: 'userSpaceOnUse',
  markerWidth: 9,
  markerHeight: 9,
  refX: 8,
  refY: 4.5,
  orient: 'auto',
} as const;

const ARROW_HEAD = 'M0,0 L8,4.5 L0,9 Z';

export function ArrowMarkers({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <marker id={`${idPrefix}-idle`} {...MARKER_PROPS}>
        <path d={ARROW_HEAD} className={styles.arrowHeadIdle} />
      </marker>
      {(Object.keys(COLORS) as PulseColor[]).map((color) => (
        <marker key={color} id={`${idPrefix}-${color}`} {...MARKER_PROPS}>
          <path d={ARROW_HEAD} fill={COLORS[color]} />
        </marker>
      ))}
    </defs>
  );
}

export function Edge({
  d,
  active,
  color,
  idPrefix,
}: {
  d: string;
  active: boolean;
  color: PulseColor;
  idPrefix: string;
}) {
  return (
    <path
      d={d}
      className={styles.edge}
      style={active ? { stroke: COLORS[color] } : undefined}
      markerEnd={`url(#${idPrefix}-${active ? color : 'idle'})`}
    />
  );
}

export function ChartNode({
  label,
  active,
  color,
  gridRow,
  gridColumn,
  centered,
  nodeRef,
}: {
  label: string;
  active: boolean;
  color: PulseColor;
  gridRow: number;
  gridColumn: number | string;
  centered?: boolean;
  nodeRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={nodeRef}
      className={styles.node}
      style={{
        gridRow,
        gridColumn,
        ...(centered
          ? { justifySelf: 'center', width: 176, maxWidth: '100%' }
          : undefined),
        ...(active
          ? {
              background: COLORS[color],
              borderColor: COLORS[color],
              color: 'white',
              transform: 'scale(1.03)',
            }
          : undefined),
      }}>
      {label}
    </div>
  );
}
