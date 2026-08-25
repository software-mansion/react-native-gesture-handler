/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PointerType } from '../src/PointerType';
import type { ButtonEvent as SpecButtonEvent } from '../src/specs/RNGestureHandlerButtonNativeComponent';
import type { ButtonEvent } from '../src/v3/types';

// Instantiate with a conditional type that resolves to `true` — a `false`
// result fails type-checking at the use site.
type StaticAssert<T extends true> = T;

// The one deliberate refinement between the twins: the codegen parser can
// only express `pointerType` as Int32, while the shared type narrows it to
// the PointerType member union. Widen it back before the structural
// comparison so the guard still catches every other kind of drift.
type WithWidenedPointerType<T extends { pointerType: PointerType }> = Omit<
  T,
  'pointerType'
> & { pointerType: number };

// The codegen spec declares its own codegen-typed twin of the shared
// `ButtonEvent` (specs must stay self-contained for the codegen parser).
// This fails `ts-check` if the two ever drift apart structurally.
type WidenedButtonEvent = WithWidenedPointerType<ButtonEvent>;
type ButtonEventMatchesSpec = StaticAssert<
  SpecButtonEvent extends WidenedButtonEvent
    ? WidenedButtonEvent extends SpecButtonEvent
      ? true
      : false
    : false
>;
