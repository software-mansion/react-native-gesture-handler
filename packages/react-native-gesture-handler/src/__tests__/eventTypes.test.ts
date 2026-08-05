import type { NativeSyntheticEvent } from 'react-native';
import { Animated } from 'react-native';

import {
  isNativeAnimatedEvent,
  maybeExtractNativeEvent,
} from '../v3/hooks/utils/eventUtils';
import type { AnimatedEvent, NativeEventWrapper } from '../v3/types';

// Compile-time assertions (verified by `yarn ts-check`, which covers test
// files): the structural stand-ins in EventTypes must stay supersets of the
// real react-native types they replaced.
type Payload = { handlerTag: number };

// A real NativeSyntheticEvent is assignable to the structural wrapper.
const syntheticEvent = {} as NativeSyntheticEvent<Payload>;
const _wrapped: NativeEventWrapper<Payload> = syntheticEvent;
void _wrapped;

// A real Animated.Value is assignable as an argument-mapping leaf.
const _animatedEvent: AnimatedEvent = {
  _argMapping: [{ nativeEvent: { handlerData: { x: new Animated.Value(0) } } }],
};
void _animatedEvent;

describe('event type structural stand-ins', () => {
  test('isNativeAnimatedEvent detects a real Animated.event object', () => {
    // The native-driver form is the one v3's `useAnimated` path consumes —
    // it returns an AnimatedEvent instance carrying `_argMapping`.
    const animatedEvent = Animated.event(
      [{ nativeEvent: { handlerData: { x: new Animated.Value(0) } } }],
      { useNativeDriver: true }
    );

    expect(isNativeAnimatedEvent(animatedEvent as never)).toBe(true);
    expect(isNativeAnimatedEvent(jest.fn())).toBe(false);
    expect(isNativeAnimatedEvent(undefined)).toBe(false);
  });

  test('maybeExtractNativeEvent unwraps wrapped events and passes plain ones through', () => {
    const plain = {
      handlerTag: 1,
      state: 4,
      handlerData: { numberOfPointers: 1, pointerType: 0 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    expect(maybeExtractNativeEvent(plain)).toBe(plain);
    expect(maybeExtractNativeEvent({ nativeEvent: plain } as never)).toBe(
      plain
    );
  });
});
