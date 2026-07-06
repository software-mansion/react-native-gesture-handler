import { PointerType } from '../PointerType';
import { tagMessage } from '../utils';
import { SingleGestureName } from '../v3/types';
import type {
  FlingGestureScenario,
  GestureOutcome,
  PanGestureScenario,
  PinchGestureScenario,
  RotationGestureScenario,
  TapGestureScenario,
} from './gestureScenarioTypes';
import type {
  JestGestureHandler,
  JestGesturePayloads,
  JestHandlerDataPayload,
} from './JestGestureHandler';

const GESTURE_OUTCOMES: GestureOutcome[] = ['success', 'failed', 'cancelled'];

// Fields of the native state machine envelope which must never appear in
// semantic scenario payloads.
const FORBIDDEN_PAYLOAD_FIELDS = [
  'state',
  'oldState',
  'handlerTag',
  'nativeEvent',
  'handlerData',
];

const COMMON_DEFAULTS = {
  numberOfPointers: 1,
  pointerType: PointerType.TOUCH,
};

const PAN_DEFAULTS: JestHandlerDataPayload = {
  ...COMMON_DEFAULTS,
  x: 0,
  y: 0,
  absoluteX: 0,
  absoluteY: 0,
  translationX: 0,
  translationY: 0,
  velocityX: 0,
  velocityY: 0,
  stylusData: undefined,
};

const TAP_DEFAULTS: JestHandlerDataPayload = {
  ...COMMON_DEFAULTS,
  x: 0,
  y: 0,
  absoluteX: 0,
  absoluteY: 0,
};

const FLING_DEFAULTS: JestHandlerDataPayload = {
  ...COMMON_DEFAULTS,
  x: 0,
  y: 0,
  absoluteX: 0,
  absoluteY: 0,
};

const PINCH_DEFAULTS: JestHandlerDataPayload = {
  ...COMMON_DEFAULTS,
  numberOfPointers: 2,
  scale: 1,
  velocity: 0,
  focalX: 0,
  focalY: 0,
  // `scaleChange` is derived by the change-event calculator, like pan's
  // `changeX`, so it is intentionally omitted here.
};

const ROTATION_DEFAULTS: JestHandlerDataPayload = {
  ...COMMON_DEFAULTS,
  numberOfPointers: 2,
  rotation: 0,
  velocity: 0,
  anchorX: 0,
  anchorY: 0,
  // `rotationChange` is derived by the change-event calculator, so it is
  // intentionally omitted here.
};

function validatePayload(
  payload: Record<string, unknown>,
  description: string
) {
  for (const field of FORBIDDEN_PAYLOAD_FIELDS) {
    if (field in payload) {
      throw new Error(
        tagMessage(
          `fireGesture scenarios describe interactions in gesture terms — '${field}' found in ${description} is managed internally and cannot be provided. ` +
            `If you need to control exact state transitions, use fireGestureHandler instead.`
        )
      );
    }
  }
}

export function validateOutcome(outcome: unknown): GestureOutcome {
  if (outcome === undefined) {
    return 'success';
  }

  if (!GESTURE_OUTCOMES.includes(outcome as GestureOutcome)) {
    throw new Error(
      tagMessage(
        `fireGesture received an unknown outcome: '${String(outcome)}'. Supported outcomes: ${GESTURE_OUTCOMES.join(', ')}.`
      )
    );
  }

  return outcome as GestureOutcome;
}

// Continuous gestures dispatch a stream of update
// events while active. The `updates` array is that stream — the first update
// is the activation payload and the last is the end payload; `begin` uses the
// defaults, since no movement has happened yet.
function buildContinuousPayloads(
  scenario: PanGestureScenario | PinchGestureScenario,
  defaults: JestHandlerDataPayload,
  gestureLabel: string
): JestGesturePayloads {
  if ('event' in scenario) {
    throw new Error(
      tagMessage(
        `fireGesture received an 'event' field for a ${gestureLabel} gesture. ${gestureLabel} is a continuous gesture — pass update payloads through 'updates' instead.`
      )
    );
  }

  const updates = (scenario.updates ?? []).map((update, index) => {
    validatePayload(update, `updates[${index}]`);
    return { ...defaults, ...update };
  });

  return {
    begin: defaults,
    activate: updates[0] ?? defaults,
    updates,
    end: updates[updates.length - 1] ?? defaults,
  };
}

export function buildPanPayloads(
  scenario: PanGestureScenario
): JestGesturePayloads {
  return buildContinuousPayloads(scenario, PAN_DEFAULTS, 'pan');
}

export function buildPinchPayloads(
  scenario: PinchGestureScenario
): JestGesturePayloads {
  return buildContinuousPayloads(scenario, PINCH_DEFAULTS, 'pinch');
}

export function buildRotationPayloads(
  scenario: RotationGestureScenario
): JestGesturePayloads {
  return buildContinuousPayloads(scenario, ROTATION_DEFAULTS, 'rotation');
}

// Tap and fling are discrete gestures: they never dispatch update events. A
// single `event` payload drives the whole lifecycle by default, but each
// state change carries its own snapshot on a real device, so `stageEvents`
// may override individual stages (merged over `event`).
function buildDiscretePayloads(
  scenario: TapGestureScenario | FlingGestureScenario,
  defaults: JestHandlerDataPayload,
  gestureLabel: string
): JestGesturePayloads {
  if ('updates' in scenario) {
    throw new Error(
      tagMessage(
        `fireGesture received 'updates' for a ${gestureLabel} gesture. ${gestureLabel} is a discrete gesture and does not dispatch update events — pass the payload through 'event' instead.`
      )
    );
  }

  const base = scenario.event ?? {};
  const stages = scenario.stageEvents ?? {};

  validatePayload(base, `'event'`);
  validatePayload(stages.begin ?? {}, `'stageEvents.begin'`);
  validatePayload(stages.activate ?? {}, `'stageEvents.activate'`);
  validatePayload(stages.end ?? {}, `'stageEvents.end'`);

  return {
    begin: { ...defaults, ...base, ...stages.begin },
    activate: { ...defaults, ...base, ...stages.activate },
    updates: [],
    end: { ...defaults, ...base, ...stages.end },
  };
}

export function buildTapPayloads(
  scenario: TapGestureScenario
): JestGesturePayloads {
  return buildDiscretePayloads(scenario, TAP_DEFAULTS, 'tap');
}

export function buildFlingPayloads(
  scenario: FlingGestureScenario
): JestGesturePayloads {
  return buildDiscretePayloads(scenario, FLING_DEFAULTS, 'fling');
}

export function buildScenarioPayloads(
  type: SingleGestureName,
  scenario:
    | PanGestureScenario
    | TapGestureScenario
    | FlingGestureScenario
    | PinchGestureScenario
    | RotationGestureScenario
): JestGesturePayloads {
  switch (type) {
    case SingleGestureName.Pan:
      return buildPanPayloads(scenario);
    case SingleGestureName.Tap:
      return buildTapPayloads(scenario);
    case SingleGestureName.Fling:
      return buildFlingPayloads(scenario);
    case SingleGestureName.Pinch:
      return buildPinchPayloads(scenario);
    case SingleGestureName.Rotation:
      return buildRotationPayloads(scenario);
    default:
      throw new Error(
        tagMessage(`fireGesture does not support '${type}' scenarios.`)
      );
  }
}

/**
 * Translates the semantic outcome into transition requests. Which of those
 * requests become observable callbacks is decided by the arbitration core,
 * not here.
 */
export function runOutcome(
  handler: JestGestureHandler,
  outcome: GestureOutcome
) {
  handler.begin();

  if (outcome === 'failed') {
    handler.fail();
    return;
  }

  handler.activate();
  handler.dispatchUpdates();

  if (outcome === 'cancelled') {
    handler.cancel();
  } else {
    handler.end();
  }
}
