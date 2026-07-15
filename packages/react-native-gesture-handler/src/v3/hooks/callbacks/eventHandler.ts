import type { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import type { ReanimatedContext } from '../../../handlers/gestures/reanimatedWrapper';
import { State } from '../../../State';
import { TouchEventType } from '../../../TouchEventType';
import type {
  ChangeCalculatorType,
  GestureCallbacks,
  GestureEndEvent,
  GestureEvent,
  GestureHandlerEventWithHandlerData,
  GestureStateChangeEventWithHandlerData,
  GestureUpdateEventWithHandlerData,
} from '../../types';
import {
  flattenAndFilterEvent,
  isEventForHandlerWithTag,
  maybeExtractNativeEvent,
  runCallback,
  touchEventTypeToCallbackType,
} from '../utils';
import { isStateChangeEvent, isTouchEvent } from '../utils/eventUtils';

function handleStateChangeEvent<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  eventWithData: GestureStateChangeEventWithHandlerData<
    THandlerData | TExtendedHandlerData
  >,
  callbacks: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  context: ReanimatedContext<TExtendedHandlerData>,
  fillInDefaultValues?: (event: GestureEvent<TExtendedHandlerData>) => void
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
    fillInDefaultValues?.(event as GestureEvent<TExtendedHandlerData>);
    runCallback(CALLBACK_TYPE.START, callbacks, event);
  } else if (
    oldState !== state &&
    (state === State.END || state === State.FAILED || state === State.CANCELLED)
  ) {
    const canceled = state === State.FAILED || state === State.CANCELLED;
    const endEvent: GestureEndEvent<THandlerData> = {
      ...event,
      canceled,
    };

    if (oldState === State.ACTIVE) {
      fillInDefaultValues?.(endEvent as GestureEndEvent<TExtendedHandlerData>);
      runCallback<THandlerData, TExtendedHandlerData>(
        CALLBACK_TYPE.END,
        callbacks,
        endEvent
      );
    }
    runCallback<THandlerData, TExtendedHandlerData>(
      CALLBACK_TYPE.FINALIZE,
      callbacks,
      endEvent
    );

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
  runCallback(CALLBACK_TYPE.UPDATE, handlers, event);

  if (context) {
    context.lastUpdateEvent = eventWithData;
  }
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
  dispatchesAnimatedEvents: boolean,
  fillInDefaultValues?: (event: GestureEvent<TExtendedHandlerData>) => void
) {
  'worklet';
  const eventWithData = maybeExtractNativeEvent(sourceEvent);

  if (!isEventForHandlerWithTag(handlerTag, eventWithData)) {
    return;
  }

  if (isStateChangeEvent(eventWithData)) {
    handleStateChangeEvent(
      eventWithData,
      handlers,
      jsContext,
      fillInDefaultValues
    );
    return;
  }

  if (isTouchEvent(eventWithData)) {
    handleTouchEvent(eventWithData, handlers);
    return;
  }

  // At this point the event should be an update event carrying `handlerData`.
  // If it isn't, it's a malformed event (e.g. a touch event that lost its
  // `allTouches` payload in a race on the native side) - drop it instead of
  // running the change calculator on undefined data, which would crash the UI
  // thread.
  if (eventWithData.handlerData === undefined) {
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
