import type {
  ReanimatedIntegration,
  WorkletsIntegration,
} from '@swmansion/gesture-handler-core';

import { tagMessage } from '../../utils';
import { installUIRuntimeBindings } from './installUIRuntimeBindings';

export type {
  NativeEventsManager,
  ReanimatedContext,
  ReanimatedHandler,
  SimplifiedShareableHost,
} from '@swmansion/gesture-handler-core';

// The wrapper's runtime objects satisfy the structural integration contracts
// the core defines; the port passes them through verbatim (see v3/binding/runtime.ts).
type ReanimatedPackage = ReanimatedIntegration;
type WorkletsPackage = WorkletsIntegration;

let Reanimated: ReanimatedPackage | undefined;
let Worklets: WorkletsPackage | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Worklets = require('react-native-worklets') as WorkletsPackage;
} catch (e) {
  // When 'react-native-worklets' is not available we want to quietly continue
  Worklets = undefined;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Reanimated = require('react-native-reanimated') as ReanimatedPackage;
} catch (e) {
  // When 'react-native-reanimated' is not available we want to quietly continue
  // @ts-ignore TS demands the variable to be initialized
  Reanimated = undefined;
}

if (Worklets !== undefined) {
  installUIRuntimeBindings(Worklets.getUIRuntimeHolder);
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

export { Reanimated, Worklets };
