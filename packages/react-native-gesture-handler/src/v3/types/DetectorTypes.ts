import {
  AnimatedEvent,
  GestureUpdateEventWithHandlerData,
  GestureHandlerEventWithHandlerData,
} from './EventTypes';

export type DetectorCallbacks<THandlerData> = {
  jsEventHandler:
    | undefined
    | ((event: GestureHandlerEventWithHandlerData<THandlerData>) => void);
  reanimatedEventHandler:
    | undefined
    | ((event: GestureHandlerEventWithHandlerData<THandlerData>) => void);
  animatedEventHandler:
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
