import { BaseGesture, BaseGestureConfig } from './gesture';
import { FlingGestureConfig, FlingGestureHandlerEventPayload } from '../FlingGestureHandler';
export declare class FlingGesture extends BaseGesture<FlingGestureHandlerEventPayload> {
    config: BaseGestureConfig & FlingGestureConfig;
    constructor();
    numberOfPointers(pointers: number): this;
    direction(direction: number): this;
}
export declare type FlingGestureType = InstanceType<typeof FlingGesture>;
