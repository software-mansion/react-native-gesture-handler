import { FlingGestureHandlerEventPayload } from '../FlingGestureHandler';
import { ForceTouchGestureHandlerEventPayload } from '../ForceTouchGestureHandler';
import { HitSlop, CommonGestureConfig, GestureTouchEvent, GestureStateChangeEvent, GestureUpdateEvent } from '../gestureHandlerCommon';
import { GestureStateManagerType } from './gestureStateManager';
import { LongPressGestureHandlerEventPayload } from '../LongPressGestureHandler';
import { PanGestureHandlerEventPayload } from '../PanGestureHandler';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';
import { TapGestureHandlerEventPayload } from '../TapGestureHandler';
import { NativeViewGestureHandlerPayload } from '../NativeViewGestureHandler';
export declare type GestureType = BaseGesture<Record<string, unknown>> | BaseGesture<Record<string, never>> | BaseGesture<TapGestureHandlerEventPayload> | BaseGesture<PanGestureHandlerEventPayload> | BaseGesture<LongPressGestureHandlerEventPayload> | BaseGesture<RotationGestureHandlerEventPayload> | BaseGesture<PinchGestureHandlerEventPayload> | BaseGesture<FlingGestureHandlerEventPayload> | BaseGesture<ForceTouchGestureHandlerEventPayload> | BaseGesture<NativeViewGestureHandlerPayload>;
export declare type GestureRef = number | GestureType | React.RefObject<GestureType | undefined> | React.RefObject<React.ComponentType | undefined>;
export interface BaseGestureConfig extends CommonGestureConfig, Record<string, unknown> {
    ref?: React.MutableRefObject<GestureType | undefined>;
    requireToFail?: GestureRef[];
    simultaneousWith?: GestureRef[];
    needsPointerData?: boolean;
    manualActivation?: boolean;
}
declare type TouchEventHandlerType = (event: GestureTouchEvent, stateManager: GestureStateManagerType) => void;
export declare type HandlerCallbacks<EventPayloadT extends Record<string, unknown>> = {
    handlerTag: number;
    onBegin?: (event: GestureStateChangeEvent<EventPayloadT>) => void;
    onStart?: (event: GestureStateChangeEvent<EventPayloadT>) => void;
    onEnd?: (event: GestureStateChangeEvent<EventPayloadT>, success: boolean) => void;
    onFinalize?: (event: GestureStateChangeEvent<EventPayloadT>, success: boolean) => void;
    onUpdate?: (event: GestureUpdateEvent<EventPayloadT>) => void;
    onChange?: (event: any) => void;
    onTouchesDown?: TouchEventHandlerType;
    onTouchesMove?: TouchEventHandlerType;
    onTouchesUp?: TouchEventHandlerType;
    onTouchesCancelled?: TouchEventHandlerType;
    changeEventCalculator?: (current: GestureUpdateEvent<Record<string, unknown>>, previous?: GestureUpdateEvent<Record<string, unknown>>) => GestureUpdateEvent<Record<string, unknown>>;
    isWorklet: boolean[];
};
export declare const CALLBACK_TYPE: {
    readonly UNDEFINED: 0;
    readonly BEGAN: 1;
    readonly START: 2;
    readonly UPDATE: 3;
    readonly CHANGE: 4;
    readonly END: 5;
    readonly FINALIZE: 6;
    readonly TOUCHES_DOWN: 7;
    readonly TOUCHES_MOVE: 8;
    readonly TOUCHES_UP: 9;
    readonly TOUCHES_CANCELLED: 10;
};
export declare type CALLBACK_TYPE = typeof CALLBACK_TYPE[keyof typeof CALLBACK_TYPE];
export declare abstract class Gesture {
    /**
     * Return array of gestures, providing the same interface for creating and updating
     * handlers, no matter which object was used to create gesture instance.
     */
    abstract toGestureArray(): GestureType[];
    /**
     * Assign handlerTag to the gesture instance and set ref.current (if a ref is set)
     */
    abstract initialize(): void;
    /**
     * Make sure that values of properties defining relations are arrays. Do any necessary
     * preprocessing required to configure relations between handlers. Called just before
     * updating the handler on the native side.
     */
    abstract prepare(): void;
}
export declare abstract class BaseGesture<EventPayloadT extends Record<string, unknown>> extends Gesture {
    handlerTag: number;
    handlerName: string;
    config: BaseGestureConfig;
    handlers: HandlerCallbacks<EventPayloadT>;
    private addDependency;
    withRef(ref: React.MutableRefObject<GestureType | undefined>): this;
    protected isWorklet(callback: Function): boolean;
    onBegin(callback: (event: GestureStateChangeEvent<EventPayloadT>) => void): this;
    onStart(callback: (event: GestureStateChangeEvent<EventPayloadT>) => void): this;
    onEnd(callback: (event: GestureStateChangeEvent<EventPayloadT>, success: boolean) => void): this;
    onFinalize(callback: (event: GestureStateChangeEvent<EventPayloadT>, success: boolean) => void): this;
    onTouchesDown(callback: TouchEventHandlerType): this;
    onTouchesMove(callback: TouchEventHandlerType): this;
    onTouchesUp(callback: TouchEventHandlerType): this;
    onTouchesCancelled(callback: TouchEventHandlerType): this;
    enabled(enabled: boolean): this;
    shouldCancelWhenOutside(value: boolean): this;
    hitSlop(hitSlop: HitSlop): this;
    simultaneousWithExternalGesture(...gestures: Exclude<GestureRef, number>[]): this;
    requireExternalGestureToFail(...gestures: Exclude<GestureRef, number>[]): this;
    initialize(): void;
    toGestureArray(): GestureType[];
    prepare(): void;
}
export declare abstract class ContinousBaseGesture<EventPayloadT extends Record<string, unknown>, EventChangePayloadT extends Record<string, unknown>> extends BaseGesture<EventPayloadT> {
    onUpdate(callback: (event: GestureUpdateEvent<EventPayloadT>) => void): this;
    onChange(callback: (event: GestureUpdateEvent<EventPayloadT & EventChangePayloadT>) => void): this;
    manualActivation(manualActivation: boolean): this;
}
export {};
