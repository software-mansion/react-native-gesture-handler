import { Gesture, GestureType } from './gesture';
export declare class ComposedGesture extends Gesture {
    protected gestures: Gesture[];
    protected simultaneousGestures: GestureType[];
    protected requireGesturesToFail: GestureType[];
    constructor(...gestures: Gesture[]);
    protected prepareSingleGesture(gesture: Gesture, simultaneousGestures: GestureType[], requireGesturesToFail: GestureType[]): void;
    prepare(): void;
    initialize(): void;
    toGestureArray(): GestureType[];
}
export declare class SimultaneousGesture extends ComposedGesture {
    prepare(): void;
}
export declare class ExclusiveGesture extends ComposedGesture {
    prepare(): void;
}
export declare type ComposedGestureType = InstanceType<typeof ComposedGesture>;
export declare type RaceGestureType = ComposedGestureType;
export declare type SimultaneousGestureType = InstanceType<typeof SimultaneousGesture>;
export declare type ExclusiveGestureType = InstanceType<typeof ExclusiveGesture>;
