import { GestureUpdateEvent } from '../gestureHandlerCommon';
import { ContinousBaseGesture } from './gesture';
export declare class ManualGesture extends ContinousBaseGesture<Record<string, never>, Record<string, never>> {
    constructor();
    onChange(callback: (event: GestureUpdateEvent<Record<string, never>>) => void): this;
}
export declare type ManualGestureType = InstanceType<typeof ManualGesture>;
