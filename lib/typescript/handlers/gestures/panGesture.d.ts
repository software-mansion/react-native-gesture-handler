import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
import { PanGestureConfig, PanGestureHandlerEventPayload } from '../PanGestureHandler';
declare type PanGestureChangeEventPayload = {
    changeX: number;
    changeY: number;
};
export declare class PanGesture extends ContinousBaseGesture<PanGestureHandlerEventPayload, PanGestureChangeEventPayload> {
    config: BaseGestureConfig & PanGestureConfig;
    constructor();
    activeOffsetY(offset: number | number[]): this;
    activeOffsetX(offset: number | number[]): this;
    failOffsetY(offset: number | number[]): this;
    failOffsetX(offset: number | number[]): this;
    minPointers(minPointers: number): this;
    maxPointers(maxPointers: number): this;
    minDistance(distance: number): this;
    minVelocity(velocity: number): this;
    minVelocityX(velocity: number): this;
    minVelocityY(velocity: number): this;
    averageTouches(value: boolean): this;
    enableTrackpadTwoFingerGesture(value: boolean): this;
    onChange(callback: (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => void): this;
}
export declare type PanGestureType = InstanceType<typeof PanGesture>;
export {};
