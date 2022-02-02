import DiscreteGestureHandler from './DiscreteGestureHandler';
import { HammerInputExt } from './GestureHandler';
declare class TapGestureHandler extends DiscreteGestureHandler {
    private _shouldFireEndEvent;
    private _timer;
    private _multiTapTimer;
    get name(): string;
    get NativeGestureClass(): TapRecognizerStatic;
    get maxDelayMs(): any;
    simulateCancelEvent(inputData: HammerInputExt): void;
    onGestureActivated(ev: HammerInputExt): void;
    onSuccessfulTap: (ev: HammerInputExt) => void;
    onRawEvent(ev: HammerInput): void;
    getHammerConfig(): {
        event: string;
        taps: any;
        interval: any;
        time: any;
        pointers: number | undefined;
    };
    updateGestureConfig({ shouldCancelWhenOutside, maxDeltaX, maxDeltaY, numberOfTaps, minDurationMs, maxDelayMs, maxDurationMs, maxDist, minPointers, maxPointers, ...props }: {
        [x: string]: any;
        shouldCancelWhenOutside?: boolean | undefined;
        maxDeltaX?: number | undefined;
        maxDeltaY?: number | undefined;
        numberOfTaps?: number | undefined;
        minDurationMs?: number | undefined;
        maxDelayMs?: number | undefined;
        maxDurationMs?: number | undefined;
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
    onGestureEnded(...props: any): void;
    onWaitingEnded(_gesture: any): void;
}
export default TapGestureHandler;
