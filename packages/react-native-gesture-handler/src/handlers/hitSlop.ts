import { isWorkletRuntime, tagMessage } from '../utils';
import type { HitSlop } from './gestureHandlerCommon';

/**
 * Canonical representation of `hitSlop`, shared by every platform:
 * `[left, top, right, bottom, width, height]`, where `null` marks an edge that
 * the user did not specify.
 *
 * The public `HitSlop` type accepts a number, `horizontal`/`vertical`
 * shorthands and per-edge values; normalizing all of that here means each
 * platform only ever parses these six slots. `width` and `height` cannot be
 * flattened into the four edges because they are resolved against the measured
 * view bounds at hit-test time, so they are carried through as-is.
 */
export type CanonicalHitSlop = [
  left: number | null,
  top: number | null,
  right: number | null,
  bottom: number | null,
  width: number | null,
  height: number | null,
];

export const HIT_SLOP_LEFT_IDX = 0;
export const HIT_SLOP_TOP_IDX = 1;
export const HIT_SLOP_RIGHT_IDX = 2;
export const HIT_SLOP_BOTTOM_IDX = 3;
export const HIT_SLOP_WIDTH_IDX = 4;
export const HIT_SLOP_HEIGHT_IDX = 5;

type HitSlopEdge =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'vertical'
  | 'horizontal'
  | 'width'
  | 'height';

type HitSlopObject = Partial<Record<HitSlopEdge, number | undefined>>;

function getHitSlopError(hitSlop: CanonicalHitSlop): string | null {
  'worklet';
  const [left, top, right, bottom, width, height] = hitSlop;

  // Unlike the edges, `width` and `height` are absolute sizes rather than
  // deltas, so a negative value describes an inverted region that no pointer
  // can fall into — the gesture would just never activate.
  if (width !== null && width < 0) {
    return "HitSlop error: 'width' cannot be negative";
  }

  if (height !== null && height < 0) {
    return "HitSlop error: 'height' cannot be negative";
  }

  if (width !== null && left !== null && right !== null) {
    return "HitSlop error: cannot have all of 'left', 'right' and 'width' defined";
  }

  if (width !== null && left === null && right === null) {
    return "HitSlop error: when 'width' is defined, either 'left' or 'right' has to be defined";
  }

  if (height !== null && top !== null && bottom !== null) {
    return "HitSlop error: cannot have all of 'top', 'bottom' and 'height' defined";
  }

  if (height !== null && top === null && bottom === null) {
    return "HitSlop error: when 'height' is defined, either 'top' or 'bottom' has to be defined";
  }

  return null;
}

function reportHitSlopError(hitSlop: CanonicalHitSlop) {
  'worklet';
  const error = getHitSlopError(hitSlop);

  if (error === null) {
    return;
  }

  // On the UI runtime this runs inside a shared value listener, where throwing
  // would tear down the listener and leave the shared value and the native
  // config out of sync. Report instead, and let the invalid value take the same
  // path it would take in a release build — validation is purely diagnostic and
  // must not change what the pipeline does.
  if (isWorkletRuntime()) {
    console.error(tagMessage(error));
    return;
  }

  throw new Error(tagMessage(error));
}

/**
 * Converts the user-facing `hitSlop` into `CanonicalHitSlop`.
 *
 * `undefined` is passed through so that the property stays out of partial
 * config updates (the platforms leave the previous value alone when the key is
 * missing), while an explicit `null` is passed through as a request to clear
 * the hit slop.
 *
 * Already normalized values are returned as-is, which keeps the function
 * idempotent — normalizing twice would otherwise find none of the edge keys on
 * the array and silently empty the hit slop.
 *
 * Runs on the UI thread as well, since `hitSlop` can be a shared value.
 */
export function normalizeHitSlop(
  hitSlop: HitSlop | CanonicalHitSlop
): CanonicalHitSlop | null | undefined {
  'worklet';

  if (hitSlop === undefined || hitSlop === null) {
    return hitSlop;
  }

  if (Array.isArray(hitSlop)) {
    return hitSlop;
  }

  if (typeof hitSlop === 'number') {
    return [hitSlop, hitSlop, hitSlop, hitSlop, null, null];
  }

  const slop = hitSlop as HitSlopObject;
  const { horizontal, vertical } = slop;

  const normalized: CanonicalHitSlop = [
    slop.left ?? horizontal ?? null,
    slop.top ?? vertical ?? null,
    slop.right ?? horizontal ?? null,
    slop.bottom ?? vertical ?? null,
    slop.width ?? null,
    slop.height ?? null,
  ];

  if (__DEV__) {
    reportHitSlopError(normalized);
  }

  return normalized;
}
