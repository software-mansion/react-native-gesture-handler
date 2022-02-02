import DraggingGestureHandler from './DraggingGestureHandler';
import { HammerInputExt } from './GestureHandler';
declare class FlingGestureHandler extends DraggingGestureHandler {
    get name(): string;
    get NativeGestureClass(): SwipeRecognizerStatic;
    onGestureActivated(event: HammerInputExt): void;
    onRawEvent(ev: HammerInputExt): void;
    getHammerConfig(): {
        pointers: any;
        direction: number;
    };
    getTargetDirections(direction: number): number[];
    getDirection(): number;
    isGestureEnabledForEvent({ numberOfPointers }: any, _recognizer: any, { maxPointers: pointerLength }: any): {
        failed: boolean;
        success?: undefined;
    } | {
        success: boolean;
        failed?: undefined;
    };
    updateGestureConfig({ numberOfPointers, direction, ...props }: any): Partial<{
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
export default FlingGestureHandler;
