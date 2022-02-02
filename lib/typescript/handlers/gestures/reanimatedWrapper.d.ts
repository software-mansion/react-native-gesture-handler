import { ComponentClass } from 'react';
import { GestureUpdateEvent, GestureStateChangeEvent } from '../gestureHandlerCommon';
export interface SharedValue<T> {
    value: T;
}
declare let Reanimated: {
    default: {
        createAnimatedComponent<P extends object>(component: ComponentClass<P>, options?: unknown): ComponentClass<P>;
    };
    useEvent: (callback: (event: GestureUpdateEvent | GestureStateChangeEvent) => void, events: string[], rebuild: boolean) => unknown;
    useSharedValue: <T>(value: T) => SharedValue<T>;
    setGestureState: (handlerTag: number, newState: number) => void;
};
export { Reanimated };
