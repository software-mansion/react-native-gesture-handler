import PressGestureHandler from './PressGestureHandler';
import { Config } from './GestureHandler';
import { HammerInputNames } from './constants';
declare class LongPressGestureHandler extends PressGestureHandler {
    get minDurationMs(): number;
    get maxDist(): number | undefined;
    updateHasCustomActivationCriteria({ maxDistSq }: Config): boolean;
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
        time: number;
        pointers: number | undefined;
    };
    getState(type: keyof typeof HammerInputNames): 1 | 4 | 5;
}
export default LongPressGestureHandler;
