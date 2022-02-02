import { HammerInputExt } from './GestureHandler';
import IndiscreteGestureHandler from './IndiscreteGestureHandler';
declare class PinchGestureHandler extends IndiscreteGestureHandler {
    get name(): string;
    get NativeGestureClass(): PinchRecognizerStatic;
    transformNativeEvent({ scale, velocity, center }: HammerInputExt): {
        focalX: number;
        focalY: number;
        velocity: number;
        scale: number;
    };
}
export default PinchGestureHandler;
