import type { SharedValue } from '../types';

// Structural check mirroring react-native-reanimated's own isSharedValue
// implementation (`value?._isReanimatedSharedValue === true`). Keeping it in
// core (instead of on the reanimated port capability) lets worklets like
// maybeUnpackValue use it without capturing any platform object, and it is
// trivially correct when reanimated is absent: no object carries the marker.
// The marker name is a cross-version reanimated contract (2.x-4.x).
export function isSharedValue<T = unknown>(
  value: unknown
): value is SharedValue<T> {
  'worklet';
  // We cannot use the `in` operator here because `value` could be a HostObject.
  return (
    (value as { _isReanimatedSharedValue?: unknown } | null | undefined)
      ?._isReanimatedSharedValue === true
  );
}
