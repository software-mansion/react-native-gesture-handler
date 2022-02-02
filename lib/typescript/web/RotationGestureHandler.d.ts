import { HammerInputExt } from './GestureHandler';
import IndiscreteGestureHandler from './IndiscreteGestureHandler';
declare class RotationGestureHandler extends IndiscreteGestureHandler {
    get name(): string;
    get NativeGestureClass(): RotateRecognizerStatic;
    transformNativeEvent({ rotation, velocity, center }: HammerInputExt): {
        rotation: number;
        anchorX: number;
        anchorY: number;
        velocity: number;
    };
}
export default RotationGestureHandler;
