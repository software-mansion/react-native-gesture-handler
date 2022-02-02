import { ContinousBaseGesture } from './gesture';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
declare type RotationGestureChangeEventPayload = {
    rotationChange: number;
};
export declare class RotationGesture extends ContinousBaseGesture<RotationGestureHandlerEventPayload, RotationGestureChangeEventPayload> {
    constructor();
    onChange(callback: (event: GestureUpdateEvent<RotationGestureHandlerEventPayload & RotationGestureChangeEventPayload>) => void): this;
}
export declare type RotationGestureType = InstanceType<typeof RotationGesture>;
export {};
