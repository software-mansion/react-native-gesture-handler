import { BaseGestureConfig, BaseGesture } from './gesture';
import { NativeViewGestureConfig, NativeViewGestureHandlerPayload } from '../NativeViewGestureHandler';
export declare class NativeGesture extends BaseGesture<NativeViewGestureHandlerPayload> {
    config: BaseGestureConfig & NativeViewGestureConfig;
    constructor();
    shouldActivateOnStart(value: boolean): this;
    disallowInterruption(value: boolean): this;
}
export declare type NativeGestureType = InstanceType<typeof NativeGesture>;
