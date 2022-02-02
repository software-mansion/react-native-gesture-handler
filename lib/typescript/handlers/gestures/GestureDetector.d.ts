import React from 'react';
import { GestureType, HandlerCallbacks } from './gesture';
import { SharedValue } from './reanimatedWrapper';
import { ComposedGesture } from './gestureComposition';
export declare type GestureConfigReference = {
    config: GestureType[];
    animatedEventHandler: unknown;
    animatedHandlers: SharedValue<HandlerCallbacks<Record<string, unknown>>[] | null> | null;
    firstExecution: boolean;
    useAnimated: boolean;
};
interface GestureDetectorProps {
    gesture?: ComposedGesture | GestureType;
}
export declare const GestureDetector: React.FunctionComponent<GestureDetectorProps>;
export {};
