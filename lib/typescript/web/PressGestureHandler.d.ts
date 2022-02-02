import { State } from '../State';
import { HammerInputNames } from './constants';
import DiscreteGestureHandler from './DiscreteGestureHandler';
import { Config, HammerInputExt } from './GestureHandler';
declare class PressGestureHandler extends DiscreteGestureHandler {
    private visualFeedbackTimer;
    private initialEvent;
    get name(): string;
    get minDurationMs(): any;
    get maxDist(): number | undefined;
    get NativeGestureClass(): PressRecognizerStatic;
    shouldDelayTouches: boolean;
    simulateCancelEvent(inputData: HammerInputExt): void;
    updateHasCustomActivationCriteria({ shouldCancelWhenOutside, maxDistSq, }: Config & {
        shouldCancelWhenOutside: boolean;
    }): boolean;
    getState(type: keyof typeof HammerInputNames): State;
    getConfig(): Partial<{
        enabled: boolean;
        minPointers: number;
        maxPointers: number;
        minDist: number;
        minDistSq: number;
        minVelocity: number;
        minVelocitySq: number;
        maxDist: number;
        maxDistSq: number;
        failOffsetXStart: number;
        failOffsetYStart: number;
        failOffsetXEnd: number;
        failOffsetYEnd: number;
        activeOffsetXStart: number;
        activeOffsetXEnd: number;
        activeOffsetYStart: number;
        activeOffsetYEnd: number;
        waitFor: any[] | null;
    }> | {
        shouldCancelWhenOutside: boolean;
        maxDistSq: number;
    };
    getHammerConfig(): {
        time: any;
        pointers: number | undefined;
    };
    onGestureActivated(ev: HammerInputExt): void;
    shouldDelayTouchForEvent({ pointerType }: HammerInputExt): boolean;
    onGestureStart(ev: HammerInputExt): void;
    sendGestureStartedEvent(ev: HammerInputExt): void;
    forceInvalidate(event: HammerInputExt): void;
    onRawEvent(ev: HammerInputExt): void;
    updateGestureConfig({ shouldActivateOnStart, disallowInterruption, shouldCancelWhenOutside, minDurationMs, maxDist, minPointers, maxPointers, ...props }: {
        [x: string]: any;
        shouldActivateOnStart?: boolean | undefined;
        disallowInterruption?: boolean | undefined;
        shouldCancelWhenOutside?: boolean | undefined;
        minDurationMs?: number | undefined;
        maxDist?: number | undefined;
        minPointers?: number | undefined;
        maxPointers?: number | undefined;
    }): Partial<{
        enabled: boolean;
        minPointers: number;
        maxPointers: number;
        minDist: number;
        minDistSq: number;
        minVelocity: number;
        minVelocitySq: number;
        maxDist: number;
        maxDistSq: number;
        failOffsetXStart: number;
        failOffsetYStart: number;
        failOffsetXEnd: number;
        failOffsetYEnd: number;
        activeOffsetXStart: number;
        activeOffsetXEnd: number;
        activeOffsetYStart: number;
        activeOffsetYEnd: number;
        waitFor: any[] | null;
    }>;
}
export default PressGestureHandler;
