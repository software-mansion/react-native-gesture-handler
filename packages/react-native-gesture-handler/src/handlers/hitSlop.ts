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

function validateHitSlop(hitSlop: CanonicalHitSlop) {
  'worklet';
  const [left, top, right, bottom, width, height] = hitSlop;

  // Unlike the edges, `width` and `height` are absolute sizes rather than
  // deltas, so a negative value describes an inverted region that no pointer
  // can fall into.
  if (width !== null && width < 0) {
    throw new Error("HitSlop error: 'width' cannot be negative");
  }

  if (height !== null && height < 0) {
    throw new Error("HitSlop error: 'height' cannot be negative");
  }

  if (width !== null && left !== null && right !== null) {
    throw new Error(
      "HitSlop error: cannot have all of 'left', 'right' and 'width' defined"
    );
  }

  if (width !== null && left === null && right === null) {
    throw new Error(
      "HitSlop error: when 'width' is defined, either 'left' or 'right' has to be defined"
    );
  }

  if (height !== null && top !== null && bottom !== null) {
    throw new Error(
      "HitSlop error: cannot have all of 'top', 'bottom' and 'height' defined"
    );
  }

  if (height !== null && top === null && bottom === null) {
    throw new Error(
      "HitSlop error: when 'height' is defined, either 'top' or 'bottom' has to be defined"
    );
  }
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
 * idempotent.
 *
 * Runs on the UI thread as well, since `hitSlop` can be a shared value.
 */
export function normalizeHitSlop(
  hitSlop: HitSlop | CanonicalHitSlop
): CanonicalHitSlop | null | undefined {
  'worklet';

  if (hitSlop === undefined || hitSlop === null || Array.isArray(hitSlop)) {
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
    validateHitSlop(normalized);
  }

  return normalized;
}
