import GestureHandler, { HammerInputExt } from './GestureHandler';
declare abstract class DraggingGestureHandler extends GestureHandler {
    get shouldEnableGestureOnSetup(): boolean;
    transformNativeEvent({ deltaX, deltaY, velocityX, velocityY, center: { x, y }, }: HammerInputExt): {
        translationX: number;
        translationY: number;
        absoluteX: number;
        absoluteY: number;
        velocityX: number;
        velocityY: number;
        x: number;
        y: number;
    };
}
export default DraggingGestureHandler;
