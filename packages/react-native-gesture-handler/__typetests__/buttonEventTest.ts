/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ButtonEvent as SpecButtonEvent } from '../src/specs/RNGestureHandlerButtonNativeComponent';
import type { ButtonEvent } from '../src/v3/types';

// Instantiate with a conditional type that resolves to `true` — a `false`
// result fails type-checking at the use site.
type StaticAssert<T extends true> = T;

// The codegen spec declares its own codegen-typed twin of the shared
// `ButtonEvent` (specs must stay self-contained for the codegen parser).
// This fails `ts-check` if the two ever drift apart structurally.
type ButtonEventMatchesSpec = StaticAssert<
  SpecButtonEvent extends ButtonEvent
    ? ButtonEvent extends SpecButtonEvent
      ? true
      : false
    : false
>;
