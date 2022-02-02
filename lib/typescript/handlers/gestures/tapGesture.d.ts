import { BaseGestureConfig, BaseGesture } from './gesture';
import { TapGestureConfig, TapGestureHandlerEventPayload } from '../TapGestureHandler';
export declare class TapGesture extends BaseGesture<TapGestureHandlerEventPayload> {
    config: BaseGestureConfig & TapGestureConfig;
    constructor();
    minPointers(minPointers: number): this;
    numberOfTaps(count: number): this;
    maxDistance(maxDist: number): this;
    maxDuration(duration: number): this;
    maxDelay(delay: number): this;
    maxDeltaX(delta: number): this;
    maxDeltaY(delta: number): this;
}
export declare type TapGestureType = InstanceType<typeof TapGesture>;
