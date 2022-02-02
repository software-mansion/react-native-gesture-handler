import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { ForceTouchGestureConfig, ForceTouchGestureHandlerEventPayload } from '../ForceTouchGestureHandler';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
declare type ForceTouchGestureChangeEventPayload = {
    forceChange: number;
};
export declare class ForceTouchGesture extends ContinousBaseGesture<ForceTouchGestureHandlerEventPayload, ForceTouchGestureChangeEventPayload> {
    config: BaseGestureConfig & ForceTouchGestureConfig;
    constructor();
    minForce(force: number): this;
    maxForce(force: number): this;
    feedbackOnActivation(value: boolean): this;
    onChange(callback: (event: GestureUpdateEvent<GestureUpdateEvent<ForceTouchGestureHandlerEventPayload & ForceTouchGestureChangeEventPayload>>) => void): this;
}
export declare type ForceTouchGestureType = InstanceType<typeof ForceTouchGesture>;
export {};
