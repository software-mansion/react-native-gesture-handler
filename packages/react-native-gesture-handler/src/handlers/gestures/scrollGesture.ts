import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
import type { ScrollGestureHandlerEventPayload } from '../GestureHandlerEventPayload';

export type ScrollGestureChangeEventPayload = {
  changeX: number;
  changeY: number;
};

function changeEventCalculator(
  current: GestureUpdateEvent<ScrollGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<ScrollGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: ScrollGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      changeX: current.scrollX,
      changeY: current.scrollY,
    };
  } else {
    changePayload = {
      changeX: current.scrollX - previous.scrollX,
      changeY: current.scrollY - previous.scrollY,
    };
  }

  return { ...current, ...changePayload };
}

export class ScrollGesture extends ContinousBaseGesture<
  ScrollGestureHandlerEventPayload,
  ScrollGestureChangeEventPayload
> {
  public config: BaseGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'ScrollGestureHandler';
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<
        ScrollGestureHandlerEventPayload & ScrollGestureChangeEventPayload
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, ScrollGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

export type ScrollGestureType = InstanceType<typeof ScrollGesture>;
