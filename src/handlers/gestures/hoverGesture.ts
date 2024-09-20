import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
import type { HoverGestureHandlerEventPayload } from '../GestureHandlerEventPayload';

export type HoverGestureChangeEventPayload = {
  changeX: number;
  changeY: number;
};

export enum HoverEffect {
  NONE = 0,
  LIFT = 1,
  HIGHLIGHT = 2,
}

export interface HoverGestureConfig {
  hoverEffect?: HoverEffect;
}

export const hoverGestureHandlerProps = ['hoverEffect'] as const;

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
   * #### iOS only
   * Sets the visual hover effect.
   */
  effect(effect: HoverEffect) {
    this.config.hoverEffect = effect;
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
