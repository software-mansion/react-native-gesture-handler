import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { GestureUpdateEvent } from '../gestureHandlerCommon';

export type HoverGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type HoverGestureChangeEventPayload = {
  changeX: number;
  changeY: number;
};

export enum HoverFeedback {
  NONE = 0,
  LIFT = 1,
  HIGHLIGHT = 2,
}

export interface HoverGestureConfig {
  hoverFeedback?: HoverFeedback;
}

export const hoverGestureHandlerProps = ['hoverFeedback'] as const;

function changeEventCalculator(
  current: GestureUpdateEvent<HoverGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<HoverGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: HoverGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      changeX: current.x,
      changeY: current.y,
    };
  } else {
    changePayload = {
      changeX: current.x - previous.x,
      changeY: current.y - previous.y,
    };
  }

  return { ...current, ...changePayload };
}

export class HoverGesture extends ContinousBaseGesture<
  HoverGestureHandlerEventPayload,
  HoverGestureChangeEventPayload
> {
  public config: BaseGestureConfig & HoverGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'HoverGestureHandler';
  }

  /**
   * Sets the visual feedback for hover.
   * iOS only
   */
  withFeedback(feedback: HoverFeedback) {
    this.config.hoverFeedback = feedback;
    return this;
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<
        HoverGestureHandlerEventPayload & HoverGestureChangeEventPayload
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, HoverGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

export type HoverGestureType = InstanceType<typeof HoverGesture>;
