import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { GestureUpdateEvent } from '../gestureHandlerCommon';

// TODO: actually send events and figure out what to send
export type HoverGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HoverGestureConfig {}

function changeEventCalculator(
  current: GestureUpdateEvent<HoverGestureHandlerEventPayload>
) {
  'worklet';
  return current;
}

export class HoverGesture extends ContinousBaseGesture<
  HoverGestureHandlerEventPayload,
  never
> {
  public config: BaseGestureConfig & HoverGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'HoverGestureHandler';
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<HoverGestureHandlerEventPayload & never>
    ) => void
  ) {
    // @ts-ignore TS being overprotective, HoverGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

export type HoverGestureType = InstanceType<typeof HoverGesture>;
