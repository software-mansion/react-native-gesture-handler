type InOutDuration = { in: number; out: number };
type LongPressDuration = { out: number };

/**
 * Configuration for press / hover animation timing.
 *
 * - A single number applies to every phase of every category.
 * - An object with top-level `in` / `out` sets the baseline; `tap` and
 *   `hover` may override either side or both — any field left out
 *   inherits the top-level value.
 * - Alternatively, both categories may be specified in full without a
 *   top-level baseline.
 *
 * `longPress` optionally customizes the press-out duration once the
 * press has been held past `delayLongPress`. If omitted, the long-press
 * release falls back to the resolved tap-out timing.
 */
export type AnimationDuration =
  | number
  | (InOutDuration & {
      tap?: Partial<InOutDuration>;
      hover?: Partial<InOutDuration>;
      longPress?: LongPressDuration;
    })
  | {
      tap: InOutDuration;
      hover: InOutDuration;
      longPress?: LongPressDuration;
    };
