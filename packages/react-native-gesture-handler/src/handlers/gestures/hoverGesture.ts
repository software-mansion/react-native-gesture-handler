import type { GestureUpdateEvent } from '../gestureHandlerCommon';
import type { HoverGestureHandlerEventPayload } from '../GestureHandlerEventPayload';
import type { BaseGestureConfig } from './gesture';
import { ContinousBaseGesture } from './gesture';

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

/**
 * @deprecated Hover Gesture is deprecated and will be removed in the future. Please use `useHoverGesture` instead.
 */
export class HoverGesture extends ContinousBaseGesture<
  HoverGestureHandlerEventPayload,
  HoverGestureChangeEventPayload
> {
  public override config: BaseGestureConfig & HoverGestureConfig = {};

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

  override onChange(
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

/**
 * @deprecated Hover Gesture is deprecated and will be removed in the future. Please use `useHoverGesture` instead.
 */
export type HoverGestureType = InstanceType<typeof HoverGesture>;
