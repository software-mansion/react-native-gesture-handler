import type {
  NativeEventsManager,
  ReanimatedIntegration,
} from '@swmansion/gesture-handler-core';

import { ghQueueMicrotask } from '../../ghQueueMicrotask';
import { tagMessage } from '../../utils';
import { NativeProxy } from '../../v3/NativeProxy';

// The type surface now lives in the core package (platform/ReanimatedIntegration
// + types/ReanimatedTypes); re-exported here for backwards compatibility with
// deep importers.
export type {
  ReanimatedContext,
  ReanimatedHandler,
} from '@swmansion/gesture-handler-core/src/v3/types';
export type { NativeEventsManager };

let Reanimated: ReanimatedIntegration | undefined;

try {
  Reanimated = require('react-native-reanimated');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const Worklets = require('react-native-worklets');

  // Make sure worklets are initialized before attempting to install UI runtime bindings
  Worklets?.scheduleOnUI(() => {
    'worklet';
  });

  ghQueueMicrotask(() => {
    const decorated = NativeProxy.installUIRuntimeBindings();

    if (!decorated) {
      console.warn(
        tagMessage(
          'Failed to install UI runtime bindings. Please report this at https://github.com/software-mansion/react-native-gesture-handler/issues.'
        )
      );
    }
  });
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

export { Reanimated };
