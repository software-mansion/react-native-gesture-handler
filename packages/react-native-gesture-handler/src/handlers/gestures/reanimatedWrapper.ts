import { ComponentClass } from 'react';
import {
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from '../gestureHandlerCommon';
import { tagMessage } from '../../utils';

export interface SharedValue<T> {
  value: T;
}

let Reanimated:
  | {
      default: {
        // Slightly modified definition copied from 'react-native-reanimated'
        createAnimatedComponent<P extends object>(
          component: ComponentClass<P>,
          options?: unknown
        ): ComponentClass<P>;
      };
      useEvent: (
        callback: (event: GestureUpdateEvent | GestureStateChangeEvent) => void,
        events: string[],
        rebuild: boolean
      ) => unknown;
      useSharedValue: <T>(value: T) => SharedValue<T>;
      setGestureState: (handlerTag: number, newState: number) => void;
    }
  | undefined;

try {
  Reanimated = require('react-native-reanimated');
} catch (e) {
  // When 'react-native-reanimated' is not available we want to quietly continue
  // @ts-ignore TS demands the variable to be initialized
  Reanimated = undefined;
}

if (!Reanimated?.useSharedValue) {
  // @ts-ignore Make sure the loaded module is actually Reanimated, if it's not
  // reset the module to undefined so we can fallback to the default implementation
  Reanimated = undefined;
}

if (Reanimated !== undefined && !Reanimated.setGestureState) {
  // The loaded module is Reanimated but it doesn't have the setGestureState defined
  Reanimated.setGestureState = () => {
    'worklet';
    console.warn(
      tagMessage(
        'Please use newer version of react-native-reanimated in order to control state of the gestures.'
      )
    );
  };
}

// Reanimated resolves `getAnimatableRef()` once, when its ref to the wrapped
// component attaches. Only versions that re-resolve it on update (their
// `AnimatedComponent` has `_refreshComponentRef`) can be handed a child's host
// instance that may change, as the legacy `Wrap` does. The class is not
// exported, so probe it by subpath, as the v3 detector does for
// `NativeEventsManager`.
let refreshesAnimatableRef = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const AnimatedComponent =
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    require('react-native-reanimated/src/createAnimatedComponent/AnimatedComponent').default;
  refreshesAnimatableRef =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof AnimatedComponent?.prototype?._refreshComponentRef === 'function';
} catch {
  // Reanimated is missing or older; keep handing Reanimated the Wrap itself.
}

export function reanimatedRefreshesAnimatableRef() {
  return refreshesAnimatableRef;
}

export { Reanimated };
