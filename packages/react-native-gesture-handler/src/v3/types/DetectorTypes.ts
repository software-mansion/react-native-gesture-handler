import {
  AnimatedEvent,
  GestureUpdateEventWithHandlerData,
  GestureHandlerEventWithHandlerData,
} from './EventTypes';

export type DetectorCallbacks<THandlerData> = {
  onGestureHandlerEvent:
    | undefined
    | ((event: GestureHandlerEventWithHandlerData<THandlerData>) => void);
  onGestureHandlerReanimatedEvent:
    | undefined
    | ((event: GestureHandlerEventWithHandlerData<THandlerData>) => void);
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
