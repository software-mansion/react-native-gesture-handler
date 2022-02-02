import * as React from 'react';
import { State } from '../State';
import { EventType } from '../EventType';
import { ValueOf } from '../typeUtils';
export declare const baseGestureHandlerProps: readonly ["id", "enabled", "shouldCancelWhenOutside", "hitSlop", "waitFor", "simultaneousHandlers", "onBegan", "onFailed", "onCancelled", "onActivated", "onEnded", "onGestureEvent", "onHandlerStateChange"];
export declare const baseGestureHandlerWithMonitorProps: string[];
export interface GestureEventPayload {
    handlerTag: number;
    numberOfPointers: number;
    state: ValueOf<typeof State>;
}
export interface HandlerStateChangeEventPayload {
    handlerTag: number;
    numberOfPointers: number;
    state: ValueOf<typeof State>;
    oldState: ValueOf<typeof State>;
}
export declare type HitSlop = number | Partial<Record<'left' | 'right' | 'top' | 'bottom' | 'vertical' | 'horizontal', number>> | Record<'width' | 'left', number> | Record<'width' | 'right', number> | Record<'height' | 'top', number> | Record<'height' | 'bottom', number>;
export interface GestureEvent<ExtraEventPayloadT = Record<string, unknown>> {
    nativeEvent: Readonly<GestureEventPayload & ExtraEventPayloadT>;
}
export interface HandlerStateChangeEvent<ExtraEventPayloadT = Record<string, unknown>> {
    nativeEvent: Readonly<HandlerStateChangeEventPayload & ExtraEventPayloadT>;
}
export declare type TouchData = {
    id: number;
    x: number;
    y: number;
    absoluteX: number;
    absoluteY: number;
};
export declare type GestureTouchEvent = {
    handlerTag: number;
    numberOfTouches: number;
    state: ValueOf<typeof State>;
    eventType: EventType;
    allTouches: TouchData[];
    changedTouches: TouchData[];
};
export declare type GestureUpdateEvent<GestureEventPayloadT = Record<string, unknown>> = GestureEventPayload & GestureEventPayloadT;
export declare type GestureStateChangeEvent<GestureStateChangeEventPayloadT = Record<string, unknown>> = HandlerStateChangeEventPayload & GestureStateChangeEventPayloadT;
export declare type CommonGestureConfig = {
    enabled?: boolean;
    shouldCancelWhenOutside?: boolean;
    hitSlop?: HitSlop;
};
export declare type BaseGestureHandlerProps<ExtraEventPayloadT extends Record<string, unknown> = Record<string, unknown>> = CommonGestureConfig & {
    id?: string;
    waitFor?: React.Ref<unknown> | React.Ref<unknown>[];
    simultaneousHandlers?: React.Ref<unknown> | React.Ref<unknown>[];
    onBegan?: (event: HandlerStateChangeEvent) => void;
    onFailed?: (event: HandlerStateChangeEvent) => void;
    onCancelled?: (event: HandlerStateChangeEvent) => void;
    onActivated?: (event: HandlerStateChangeEvent) => void;
    onEnded?: (event: HandlerStateChangeEvent) => void;
    onGestureEvent?: (event: GestureEvent<ExtraEventPayloadT>) => void;
    onHandlerStateChange?: (event: HandlerStateChangeEvent<ExtraEventPayloadT>) => void;
};
export declare function filterConfig(props: Record<string, unknown>, validProps: string[], defaults?: Record<string, unknown>): {
    [x: string]: unknown;
};
export declare function findNodeHandle(node: null | number | React.Component<any, any> | React.ComponentClass<any>): null | number | React.Component<any, any> | React.ComponentClass<any>;
