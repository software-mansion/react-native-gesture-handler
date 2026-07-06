import type { GestureRelationPolicy } from '../handlers/gestureArbitration/GestureArbitrationTypes';
import GestureArbitrator from '../handlers/gestureArbitration/GestureArbitrator';
import { BaseGesture } from '../handlers/gestures/gesture';
import { tagMessage } from '../utils';
import type { AnySingleGesture } from '../v3/hooks/gestures/singleGestureUnion';
import { maybeUnpackValue } from '../v3/hooks/utils';
import { SingleGestureName } from '../v3/types';
import {
  buildScenarioPayloads,
  runOutcome,
  runOutcomeAsync,
  validateOutcome,
} from './gestureScenarios';
import type {
  FireGestureTarget,
  FlingGestureScenario,
  GestureOutcome,
  LongPressGestureScenario,
  NoInferT,
  PanGestureScenario,
  PinchGestureScenario,
  RotationGestureScenario,
  ScenarioForTarget,
  TapGestureScenario,
} from './gestureScenarioTypes';
import type { JestGestureEvent } from './JestGestureHandler';
import { JestGestureHandler } from './JestGestureHandler';
import { getByGestureTestId } from './jestUtils';

let act = (callback: () => void) => callback();
let actAsync = async (callback: () => void | Promise<void>) => {
  await callback();
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  if (typeof React.act === 'function') {
    act = (callback: () => void) => {
      React.act(() => {
        callback();
      });
    };
    actAsync = async (callback: () => void | Promise<void>) => {
      await React.act(async () => {
        await callback();
      });
    };
  }
} catch (_e) {
  // Do nothing if not available
}

const SUPPORTED_GESTURES = new Set<SingleGestureName>([
  SingleGestureName.Tap,
  SingleGestureName.Pan,
  SingleGestureName.Fling,
  SingleGestureName.Pinch,
  SingleGestureName.Rotation,
  SingleGestureName.LongPress,
]);

const SUPPORTED_GESTURES_MESSAGE =
  'Currently supported gesture kinds: tap (useTapGesture), pan (usePanGesture), fling (useFlingGesture), pinch (usePinchGesture), rotation (useRotationGesture) and long press (useLongPressGesture).';

type AnyGestureScenario =
  | PanGestureScenario
  | TapGestureScenario
  | FlingGestureScenario
  | PinchGestureScenario
  | RotationGestureScenario
  | LongPressGestureScenario;

function isHookGesture(target: object): target is AnySingleGesture {
  return 'detectorCallbacks' in target && 'type' in target;
}

// Only one handler participates for now, so the policy resolves every
// relation to "independent". Grouped scenarios will derive the policy from
// the participating gestures' `gestureRelations`.
const jestRelationPolicy: GestureRelationPolicy<JestGestureHandler> = {
  shouldHandlerWaitForOther: () => false,
  shouldRecognizeSimultaneously: () => false,
  shouldBeCancelledByOther: () => false,
  shouldBeCancelledByDefault: () => false,
  shouldBeginWithRecordedHandlers: () => true,
};

interface PreparedGesture {
  handler: JestGestureHandler;
  arbitrator: GestureArbitrator<JestGestureHandler>;
  outcome: GestureOutcome;
  /** Milliseconds the clock should advance between begin and activation. */
  duration: number;
}

/**
 * Resolves and validates the target, builds the scenario payloads and creates
 * the lightweight Jest handler. Returns `null` when the interaction is a
 * no-op (a disabled gesture), matching `fireGestureHandler`.
 */
function prepareGesture(
  target: FireGestureTarget,
  scenario: AnyGestureScenario | undefined
): PreparedGesture | null {
  const resolved =
    typeof target === 'string' ? getByGestureTestId(target) : target;

  if (resolved instanceof BaseGesture) {
    throw new Error(
      tagMessage(
        `fireGesture supports only gestures created with the v3 hooks API. ` +
          `For gestures created with the builder API, use fireGestureHandler instead.`
      )
    );
  }

  if (
    typeof resolved !== 'object' ||
    resolved === null ||
    !isHookGesture(resolved)
  ) {
    throw new Error(
      tagMessage(
        `fireGesture received an unsupported target. Pass a gesture test ID or a gesture returned by a v3 hook. ` +
          `For components and builder gestures, use fireGestureHandler instead.`
      )
    );
  }

  const gesture = resolved;

  if (!SUPPORTED_GESTURES.has(gesture.type)) {
    throw new Error(
      tagMessage(
        `fireGesture does not support '${gesture.type}' yet. ${SUPPORTED_GESTURES_MESSAGE}`
      )
    );
  }

  // Disabled gestures produce no callbacks, matching fireGestureHandler.
  if (maybeUnpackValue<boolean>(gesture.config.enabled) === false) {
    return null;
  }

  const gestureScenario: AnyGestureScenario = scenario ?? {};
  const outcome = validateOutcome(gestureScenario.outcome);
  const payloads = buildScenarioPayloads(gesture.type, gestureScenario);

  const duration =
    gesture.type === SingleGestureName.LongPress
      ? ((gestureScenario as LongPressGestureScenario).duration ?? 0)
      : 0;

  const arbitrator = new GestureArbitrator<JestGestureHandler>(
    jestRelationPolicy
  );

  // The exact event generics cannot be correlated across the gesture union,
  // but the emitted envelopes match the v3 event handler contract.
  const jsEventHandler = gesture.detectorCallbacks.jsEventHandler as
    | ((event: JestGestureEvent) => void)
    | undefined;

  const handler = new JestGestureHandler(
    gesture.handlerTag,
    arbitrator,
    (event: JestGestureEvent) => {
      jsEventHandler?.(event);
    },
    payloads
  );

  return { handler, arbitrator, outcome, duration };
}

/**
 * Advance the clock so JavaScript timers scheduled by the application (e.g. a
 * long-press timer started in `onBegin`) fire. Provided to `fireGesture.setup`.
 */
export interface FireGestureSetupOptions {
  /**
   * Advances timers by the given number of milliseconds. Pass
   * `jest.advanceTimersByTime` when using fake timers, or a real-timer waiter
   * such as `(ms) => new Promise((r) => setTimeout(r, ms))`. The helper never
   * switches Jest timer modes itself.
   */
  advanceTimers: (durationMs: number) => void | Promise<void>;
}

export type FireGestureWithTimers = <TTarget extends FireGestureTarget>(
  target: TTarget,
  scenario?: ScenarioForTarget<NoInferT<TTarget>>
) => Promise<void>;

/**
 * Simulates the JavaScript callback lifecycle of a single v3 gesture
 * interaction. It does not run the platform gesture recognizer — use
 * device-level tests when behavior depends on recognition thresholds, hit
 * testing, gesture competition or platform-specific input handling.
 *
 * The target may be a gesture test ID or a gesture returned by a v3 hook.
 * The gesture kind is inferred from the resolved target.
 *
 * ```ts
 * fireGesture('save-button');
 *
 * fireGesture('draggable-card', {
 *   updates: [{ translationX: 20 }, { translationX: 100 }],
 * });
 *
 * fireGesture(pan, { updates: [{ translationX: 100 }], outcome: 'cancelled' });
 * ```
 *
 * Every requested state change is routed through the same arbitration core
 * that drives the web implementation, so the emitted callback lifecycle
 * matches the runtime contract.
 *
 * For gestures whose application logic depends on elapsed time (e.g. a long
 * press whose component starts a timer in `onBegin`), create a timer-aware
 * variant with {@link fireGesture.setup}.
 */
function fireGestureImpl<TTarget extends FireGestureTarget>(
  target: TTarget,
  scenario?: ScenarioForTarget<NoInferT<TTarget>>
): void {
  const prepared = prepareGesture(target, scenario as AnyGestureScenario);
  if (!prepared) {
    return;
  }

  const { handler, arbitrator, outcome } = prepared;

  try {
    act(() => {
      runOutcome(handler, outcome);
    });
  } finally {
    // Each call uses its own arbitration session; dispose it so no handler
    // state leaks between tests.
    arbitrator.reset();
  }
}

/**
 * Creates a timer-aware `fireGesture`. The returned function is async: it
 * advances the clock between begin and activation using the supplied
 * `advanceTimers`, so timers started in `onBegin` fire before activation.
 *
 * ```ts
 * const fireGestureWithTimers = fireGesture.setup({
 *   advanceTimers: jest.advanceTimersByTime,
 * });
 *
 * await fireGestureWithTimers(longPress, { duration: 800 });
 * ```
 */
function setup(options: FireGestureSetupOptions): FireGestureWithTimers {
  const { advanceTimers } = options;

  return async function fireGestureWithTimers(target, scenario) {
    const prepared = prepareGesture(target, scenario as AnyGestureScenario);
    if (!prepared) {
      return;
    }

    const { handler, arbitrator, outcome, duration } = prepared;

    try {
      await actAsync(async () => {
        await runOutcomeAsync(handler, outcome, () => advanceTimers(duration));
      });
    } finally {
      arbitrator.reset();
    }
  };
}

export const fireGesture = Object.assign(fireGestureImpl, { setup });
