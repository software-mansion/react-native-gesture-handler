import {
  flattenAndFilterEvent,
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
import { isStateChangeEvent, isTouchEvent } from '../utils/eventUtils';

function handleStateChangeEvent<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  eventWithData: GestureStateChangeEventWithHandlerData<THandlerData>,
  callbacks: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  context: ReanimatedContext<TExtendedHandlerData>
) {
  'worklet';
  const { oldState, state } = eventWithData;
  const event = flattenAndFilterEvent(eventWithData);

  if (oldState === State.UNDETERMINED && state === State.BEGAN) {
    runCallback(CALLBACK_TYPE.BEGAN, callbacks, event);
  } else if (
    (oldState === State.BEGAN || oldState === State.UNDETERMINED) &&
    state === State.ACTIVE
  ) {
    runCallback(CALLBACK_TYPE.START, callbacks, event);
  } else if (oldState !== state && state === State.END) {
    if (oldState === State.ACTIVE) {
      runCallback(CALLBACK_TYPE.END, callbacks, event, true);
    }
    runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, true);

    if (context) {
      context.lastUpdateEvent = undefined;
    }
  } else if (
    (state === State.FAILED || state === State.CANCELLED) &&
    state !== oldState
  ) {
    if (oldState === State.ACTIVE) {
      runCallback(CALLBACK_TYPE.END, callbacks, event, false);
    }
    runCallback(CALLBACK_TYPE.FINALIZE, callbacks, event, false);

    if (context) {
      context.lastUpdateEvent = undefined;
    }
  }
}

export function handleUpdateEvent<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  eventWithData: GestureUpdateEventWithHandlerData<TExtendedHandlerData>,
  handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  changeEventCalculator: ChangeCalculatorType<TExtendedHandlerData> | undefined,
  context: ReanimatedContext<TExtendedHandlerData>
) {
  'worklet';
  const eventWithChanges = changeEventCalculator
    ? changeEventCalculator(
        eventWithData,
        context ? context.lastUpdateEvent : undefined
      )
    : eventWithData;

  const event = flattenAndFilterEvent(eventWithChanges);

  // This should never happen, but since we don't want to call hooks conditionally, we have to mark
  // context as possibly undefined to make TypeScript happy.
  if (!context) {
    throw new Error(tagMessage('Event handler context is not defined'));
  }

  runCallback(CALLBACK_TYPE.UPDATE, handlers, event);

  context.lastUpdateEvent = eventWithData;
}

export function handleTouchEvent<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  event: GestureTouchEvent,
  handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>
) {
  'worklet';

  if (event.eventType !== TouchEventType.UNDETERMINED) {
    runCallback(touchEventTypeToCallbackType(event.eventType), handlers, event);
  }
}

export function eventHandler<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  sourceEvent: GestureHandlerEventWithHandlerData<
    THandlerData,
    TExtendedHandlerData
  >,
  handlers: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  changeEventCalculator: ChangeCalculatorType<TExtendedHandlerData> | undefined,
  jsContext: ReanimatedContext<TExtendedHandlerData>,
  dispatchesAnimatedEvents: boolean
) {
  'worklet';
  const eventWithData = maybeExtractNativeEvent(sourceEvent);

  if (!isEventForHandlerWithTag(handlerTag, eventWithData)) {
    return;
  }

  if (isStateChangeEvent(eventWithData)) {
    handleStateChangeEvent(eventWithData, handlers, jsContext);
    return;
  }

  if (isTouchEvent(eventWithData)) {
    handleTouchEvent(eventWithData, handlers);
    return;
  }

  if (!dispatchesAnimatedEvents) {
    handleUpdateEvent(
      eventWithData,
      handlers,
      changeEventCalculator,
      jsContext
    );
  }
}
