import {
  flattenEvent,
  isEventForHandlerWithTag,
  maybeExtractNativeEvent,
  runCallback,
  touchEventTypeToCallbackType,
} from '../utils';
import { tagMessage } from '../../../utils';
import { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import {
  ChangeCalculatorType,
  GestureCallbacks,
  GestureHandlerEventWithHandlerData,
  GestureStateChangeEventWithHandlerData,
  GestureUpdateEventWithHandlerData,
} from '../../types';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { State } from '../../../State';
import { TouchEventType } from '../../../TouchEventType';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';

function handleStateChange<THandlerData>(
  eventWithData: GestureStateChangeEventWithHandlerData<THandlerData>,
  callbacks: GestureCallbacks<THandlerData>,
  context: ReanimatedContext<THandlerData>
) {
  'worklet';
  const event = flattenEvent(eventWithData);

  if (event.oldState === State.UNDETERMINED && event.state === State.BEGAN) {
    runCallback(CALLBACK_TYPE.BEGAN, callbacks, event);
  } else if (
    (event.oldState === State.BEGAN || event.oldState === State.UNDETERMINED) &&
    event.state === State.ACTIVE
  ) {
    runCallback(CALLBACK_TYPE.START, callbacks, event);
  } else if (event.oldState !== event.state && event.state === State.END) {
    if (event.oldState === State.ACTIVE) {
      runCallback(CALLBACK_TYPE.END, callbacks, event, true);
    }
    runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, true);

    if (context) {
      context.lastUpdateEvent = undefined;
    }
  } else if (
    (event.state === State.FAILED || event.state === State.CANCELLED) &&
    event.state !== event.oldState
  ) {
    if (event.oldState === State.ACTIVE) {
      runCallback(CALLBACK_TYPE.END, callbacks, event, false);
    }
    runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, false);

    if (context) {
      context.lastUpdateEvent = undefined;
    }
  }
}

export function handleUpdate<THandlerData>(
  eventWithData: GestureUpdateEventWithHandlerData<THandlerData>,
  handlers: GestureCallbacks<THandlerData>,
  changeEventCalculator: ChangeCalculatorType<THandlerData> | undefined,
  context: ReanimatedContext<THandlerData>
) {
  'worklet';
  const eventWithChanges = changeEventCalculator
    ? changeEventCalculator(
        eventWithData,
        context ? context.lastUpdateEvent : undefined
      )
    : eventWithData;

  const event = flattenEvent(eventWithChanges);

  // This should never happen, but since we don't want to call hooks conditionally, we have to mark
  // context as possibly undefined to make TypeScript happy.
  if (!context) {
    throw new Error(tagMessage('Event handler context is not defined'));
  }

  runCallback(CALLBACK_TYPE.UPDATE, handlers, event);

  context.lastUpdateEvent = eventWithData;
}

export function handleTouchEvent<THandlerData>(
  event: GestureTouchEvent,
  handlers: GestureCallbacks<THandlerData>
) {
  'worklet';

  if (event.eventType !== TouchEventType.UNDETERMINED) {
    runCallback(touchEventTypeToCallbackType(event.eventType), handlers, event);
  }
}

export function stateMachine<THandlerData>(
  handlerTag: number,
  sourceEvent: GestureHandlerEventWithHandlerData<THandlerData>,
  handlers: GestureCallbacks<THandlerData>,
  changeEventCalculator: ChangeCalculatorType<THandlerData> | undefined,
  jsContext: ReanimatedContext<THandlerData>,
  dispatchesAnimatedEvents: boolean
) {
  'worklet';
  const eventWithData = maybeExtractNativeEvent(sourceEvent);

  if (!isEventForHandlerWithTag(handlerTag, eventWithData)) {
    return;
  }

  if ('oldState' in eventWithData && eventWithData.oldState !== undefined) {
    handleStateChange(eventWithData, handlers, jsContext);
  } else if ('allTouches' in eventWithData) {
    handleTouchEvent(eventWithData, handlers);
  } else if (!dispatchesAnimatedEvents) {
    handleUpdate(eventWithData, handlers, changeEventCalculator, jsContext);
  }
}
