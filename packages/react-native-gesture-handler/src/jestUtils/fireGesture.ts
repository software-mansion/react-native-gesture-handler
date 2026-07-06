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
  validateOutcome,
} from './gestureScenarios';
import type {
  FireGestureTarget,
  FlingGestureScenario,
  NoInferT,
  PanGestureScenario,
  PinchGestureScenario,
  ScenarioForTarget,
  TapGestureScenario,
} from './gestureScenarioTypes';
import type { JestGestureEvent } from './JestGestureHandler';
import { JestGestureHandler } from './JestGestureHandler';
import { getByGestureTestId } from './jestUtils';

let act = (callback: () => void) => callback();

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  if (typeof React.act === 'function') {
    act = (callback: () => void) => {
      React.act(() => {
        callback();
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
]);

const SUPPORTED_GESTURES_MESSAGE =
  'Currently supported gesture kinds: tap (useTapGesture), pan (usePanGesture), fling (useFlingGesture) and pinch (usePinchGesture).';

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

/**
 * Simulates the JavaScript callback lifecycle of a single v3 gesture
 * interaction.
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
 */
export function fireGesture<TTarget extends FireGestureTarget>(
  target: TTarget,
  scenario?: ScenarioForTarget<NoInferT<TTarget>>
): void {
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
    return;
  }

  const gestureScenario:
    | PanGestureScenario
    | TapGestureScenario
    | FlingGestureScenario
    | PinchGestureScenario = scenario ?? {};
  const outcome = validateOutcome(gestureScenario.outcome);
  const payloads = buildScenarioPayloads(gesture.type, gestureScenario);

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
