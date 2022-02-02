import GestureHandler from './GestureHandler';
declare abstract class DiscreteGestureHandler extends GestureHandler {
    get isDiscrete(): boolean;
    get shouldEnableGestureOnSetup(): boolean;
    shouldFailUnderCustomCriteria({ x, y, deltaX, deltaY }: any, { maxDeltaX, maxDeltaY, maxDistSq, shouldCancelWhenOutside }: any): boolean;
    transformNativeEvent({ center: { x, y } }: any): {
        absoluteX: any;
        absoluteY: any;
        x: number;
        y: number;
    };
    isGestureEnabledForEvent({ minPointers, maxPointers, maxDeltaX, maxDeltaY, maxDistSq, shouldCancelWhenOutside, }: any, _recognizer: any, { maxPointers: pointerLength, center, deltaX, deltaY }: any): {
        failed: boolean;
        success?: undefined;
    } | {
        success: boolean;
        failed?: undefined;
    };
}
export default DiscreteGestureHandler;
