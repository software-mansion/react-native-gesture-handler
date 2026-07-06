import { PointerType } from '../PointerType';
import { tagMessage } from '../utils';
import { SingleGestureName } from '../v3/types';
import type {
  GestureOutcome,
  PanGestureScenario,
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

export function buildPanPayloads(
  scenario: PanGestureScenario
): JestGesturePayloads {
  if ('event' in scenario) {
    throw new Error(
      tagMessage(
        `fireGesture received an 'event' field for a pan gesture. Pan is a continuous gesture — pass update payloads through 'updates' instead.`
      )
    );
  }

  const updates = (scenario.updates ?? []).map((update, index) => {
    validatePayload(update, `updates[${index}]`);
    return { ...PAN_DEFAULTS, ...update };
  });

  return {
    begin: PAN_DEFAULTS,
    activate: updates[0] ?? PAN_DEFAULTS,
    updates,
    end: updates[updates.length - 1] ?? PAN_DEFAULTS,
  };
}

export function buildTapPayloads(
  scenario: TapGestureScenario
): JestGesturePayloads {
  if ('updates' in scenario) {
    throw new Error(
      tagMessage(
        `fireGesture received 'updates' for a tap gesture. Tap is a discrete gesture and does not dispatch update events — pass the payload through 'event' instead.`
      )
    );
  }

  const event = { ...TAP_DEFAULTS, ...scenario.event };
  validatePayload(scenario.event ?? {}, `'event'`);

  return {
    begin: event,
    activate: event,
    updates: [],
    end: event,
  };
}

export function buildScenarioPayloads(
  type: SingleGestureName,
  scenario: PanGestureScenario | TapGestureScenario
): JestGesturePayloads {
  switch (type) {
    case SingleGestureName.Pan:
      return buildPanPayloads(scenario);
    case SingleGestureName.Tap:
      return buildTapPayloads(scenario);
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
