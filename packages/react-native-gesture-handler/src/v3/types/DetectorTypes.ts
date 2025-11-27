import {
  AnimatedEvent,
  StateChangeEventWithHandlerData,
  UpdateEventWithHandlerData,
  TouchEvent,
  GestureUpdateEventWithHandlerData,
} from './EventTypes';

export type DetectorCallbacks<THandlerData> = {
  onGestureHandlerStateChange: (
    event: StateChangeEventWithHandlerData<THandlerData>
  ) => void;
  onGestureHandlerEvent:
    | undefined
    | ((event: UpdateEventWithHandlerData<THandlerData>) => void);
  onGestureHandlerTouchEvent: (event: TouchEvent) => void;
  onReanimatedStateChange:
    | undefined
    | ((event: StateChangeEventWithHandlerData<THandlerData>) => void);
  onReanimatedUpdateEvent:
    | undefined
    | ((event: UpdateEventWithHandlerData<THandlerData>) => void);
  onReanimatedTouchEvent: undefined | ((event: TouchEvent) => void);
  onGestureHandlerAnimatedEvent:
    | undefined
    | AnimatedEvent
    | ((event: GestureUpdateEventWithHandlerData<THandlerData>) => void);
};

export type VirtualChild = {
  viewTag: number;
  handlerTags: number[];
  methods: DetectorCallbacks<unknown>;

  // only set on web
  viewRef: unknown;
};
