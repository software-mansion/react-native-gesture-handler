import { ContinousBaseGesture } from './gesture';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
declare type PinchGestureChangeEventPayload = {
    scaleChange: number;
};
export declare class PinchGesture extends ContinousBaseGesture<PinchGestureHandlerEventPayload, PinchGestureChangeEventPayload> {
    constructor();
    onChange(callback: (event: GestureUpdateEvent<PinchGestureHandlerEventPayload & PinchGestureChangeEventPayload>) => void): this;
}
export declare type PinchGestureType = InstanceType<typeof PinchGesture>;
export {};
