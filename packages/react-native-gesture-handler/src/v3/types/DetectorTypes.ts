import {
  AnimatedEvent,
  StateChangeEvent,
  UpdateEvent,
  TouchEvent,
  GestureUpdateEvent,
} from './EventTypes';

export type DetectorCallbacks<THandlerData> = {
  onGestureHandlerStateChange: (event: StateChangeEvent<THandlerData>) => void;
  onGestureHandlerEvent:
    | undefined
    | ((event: UpdateEvent<THandlerData>) => void);
  onGestureHandlerTouchEvent: (event: TouchEvent) => void;
  onReanimatedStateChange:
    | undefined
    | ((event: StateChangeEvent<THandlerData>) => void);
  onReanimatedUpdateEvent:
    | undefined
    | ((event: UpdateEvent<THandlerData>) => void);
  onReanimatedTouchEvent: undefined | ((event: TouchEvent) => void);
  onGestureHandlerAnimatedEvent:
    | undefined
    | AnimatedEvent
    | ((event: GestureUpdateEvent<THandlerData>) => void);
};

export type VirtualChild = {
  viewTag: number;
  handlerTags: number[];
  methods: DetectorCallbacks<unknown>;

  // only set on web
  viewRef: unknown;
};
