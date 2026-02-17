import {
  AnimatedEvent,
  GestureUpdateEventWithHandlerData,
  GestureHandlerEventWithHandlerData,
} from './EventTypes';

export type DetectorCallbacks<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> = {
  jsEventHandler:
    | undefined
    | ((
        event: GestureHandlerEventWithHandlerData<
          THandlerData,
          TExtendedHandlerData
        >
      ) => void);
  reanimatedEventHandler:
    | undefined
    | ((
        event: GestureHandlerEventWithHandlerData<
          THandlerData,
          TExtendedHandlerData
        >
      ) => void);
  animatedEventHandler:
    | undefined
    | AnimatedEvent
    | ((
        event: GestureUpdateEventWithHandlerData<TExtendedHandlerData>
      ) => void);
};

export type VirtualChild = {
  viewTag: number;
  handlerTags: number[];
  methods: DetectorCallbacks<unknown, unknown>;

  // only set on web
  viewRef: unknown;
};
