import type { GestureUpdateEvent } from '../gestureHandlerCommon';
import { ContinousBaseGesture } from './gesture';

function changeEventCalculator(
  current: GestureUpdateEvent<Record<string, never>>,
  _previous?: GestureUpdateEvent<Record<string, never>>
) {
  'worklet';
  return current;
}

/**
 * @deprecated `ManualGesture` is deprecated and will be removed in the future. Please use `useManualGesture` instead.
 */
export class ManualGesture extends ContinousBaseGesture<
  Record<string, never>,
  Record<string, never>
> {
  constructor() {
    super();

    this.handlerName = 'ManualGestureHandler';
  }

  override onChange(
    callback: (event: GestureUpdateEvent<Record<string, never>>) => void
  ) {
    // @ts-ignore TS being overprotective, Record<string, never> is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

/**
 * @deprecated `ManualGestureType` is deprecated and will be removed in the future. Please use `ManualGesture` instead.
 */
export type ManualGestureType = InstanceType<typeof ManualGesture>;
