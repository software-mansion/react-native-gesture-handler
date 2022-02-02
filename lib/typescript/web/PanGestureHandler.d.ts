import { EventMap } from './constants';
import DraggingGestureHandler from './DraggingGestureHandler';
import { State } from '../State';
import { Config, HammerInputExt } from './GestureHandler';
declare class PanGestureHandler extends DraggingGestureHandler {
    get name(): string;
    get NativeGestureClass(): PanRecognizerStatic;
    getHammerConfig(): {
        direction: number;
        pointers: number | undefined;
    };
    getState(type: keyof typeof EventMap): State;
    getDirection(): number;
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
    }>;
    shouldFailUnderCustomCriteria({ deltaX, deltaY }: HammerInputExt, criteria: any): boolean;
    shouldActivateUnderCustomCriteria({ deltaX, deltaY, velocity }: any, criteria: any): boolean;
    shouldMultiFingerPanFail({ pointerLength, scale, deltaRotation, }: {
        deltaRotation: number;
        pointerLength: number;
        scale: number;
    }): boolean;
    updateHasCustomActivationCriteria(criteria: Config & {
        minVelocityX?: number;
        minVelocityY?: number;
    }): boolean;
    isGestureEnabledForEvent(props: any, _recognizer: any, inputData: HammerInputExt & {
        deltaRotation: number;
    }): {
        failed: boolean;
        success?: undefined;
    } | {
        success: boolean;
        failed?: undefined;
    };
}
export default PanGestureHandler;
