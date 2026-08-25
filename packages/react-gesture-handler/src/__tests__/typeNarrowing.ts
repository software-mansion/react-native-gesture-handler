import type { SharedValue } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';

import type {
  PanGestureConfig,
  TapGestureConfig,
  useTapGesture,
} from '../index';

// Compile-time assertions, enforced by ts-check (this package has no jest):
// the plain-DOM package's public gesture configs must NOT accept
// SharedValue-wrapped members — reanimated does not exist on this platform.
// Each `@ts-expect-error` line fails the build if the assignment
// unexpectedly compiles.

declare const sharedBoolean: SharedValue<boolean>;
declare const sharedNumber: SharedValue<number>;

// Plain configs (including callbacks and nested objects) remain accepted.
export const plainTap: TapGestureConfig = {
  numberOfTaps: 2,
  enabled: true,
  onActivate: () => {
    // no-op
  },
};
export const plainPan: PanGestureConfig = {
  enabled: true,
  onUpdate: () => {
    // no-op
  },
};

// @ts-expect-error `enabled` must be a plain boolean on the DOM binding.
export const sharedValueEnabled: TapGestureConfig = { enabled: sharedBoolean };

// prettier-ignore — the literal must stay on the directive's next line.
// @ts-expect-error gesture-specific numeric props must be plain numbers.
export const sharedValueTaps: TapGestureConfig = { numberOfTaps: sharedNumber };

// The hook signature accepts exactly the narrowed config.
type TapHookParam = NonNullable<Parameters<typeof useTapGesture>[0]>;
export const hookParam: TapHookParam = plainTap;
