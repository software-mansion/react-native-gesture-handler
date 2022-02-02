import GestureHandler from './GestureHandler';
/**
 * The base class for **Rotation** and **Pinch** gesture handlers.
 */
declare abstract class IndiscreteGestureHandler extends GestureHandler {
    get shouldEnableGestureOnSetup(): boolean;
    updateGestureConfig({ minPointers, maxPointers, ...props }: {
        [x: string]: any;
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
    isGestureEnabledForEvent({ minPointers, maxPointers }: any, _recognizer: any, { maxPointers: pointerLength }: any): {
        failed: boolean;
        success?: undefined;
    } | {
        success: boolean;
        failed?: undefined;
    };
}
export default IndiscreteGestureHandler;
