import { BaseGesture, BaseGestureConfig } from './gesture';
import { LongPressGestureConfig, LongPressGestureHandlerEventPayload } from '../LongPressGestureHandler';
export declare class LongPressGesture extends BaseGesture<LongPressGestureHandlerEventPayload> {
    config: BaseGestureConfig & LongPressGestureConfig;
    constructor();
    minDuration(duration: number): this;
    maxDistance(distance: number): this;
}
export declare type LongPressGestureType = InstanceType<typeof LongPressGesture>;
