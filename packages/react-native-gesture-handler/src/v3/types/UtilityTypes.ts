import { PanGestureNativeProperties } from '../hooks/gestures/pan/PanProperties';
import { FlingGestureNativeProperties } from '../hooks/gestures/fling/FlingProperties';
import { HoverGestureNativeProperties } from '../hooks/gestures/hover/HoverProperties';
import { LongPressGestureNativeProperties } from '../hooks/gestures/longPress/LongPressProperties';
import { NativeGestureNativeProperties } from '../hooks/gestures/native/NativeProperties';
import { TapGestureNativeConfig } from '../hooks/gestures/tap/TapProperties';
import { InternalConfigProps } from './ConfigTypes';

export type HandlersPropsWhiteList =
  | Set<keyof PanGestureNativeProperties>
  | Set<keyof FlingGestureNativeProperties>
  | Set<keyof HoverGestureNativeProperties>
  | Set<keyof LongPressGestureNativeProperties>
  | Set<keyof NativeGestureNativeProperties>
  | Set<keyof TapGestureNativeConfig>;

// Some handlers do not have specific properties (e.g. `Pinch`), therefore we mark those prop types as `Record<string, never>`.
// Doing intersection with those types results in type which cannot have any property. In order to fix that,
// we filter out properties with `never` values.
//
// This piece of magic works like this:
// 1. We iterate over all keys of T using `keyof T`
// 2. We check if the type of property is `never` using conditional types (`T[K] extends never ? never : K`).
//    If it is, we replace the key with `never`, i.e. we delete it. Otherwise we keep it as is.
export type FilterNeverProperties<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type ExcludeInternalConfigProps<T> = Omit<
  T,
  keyof InternalConfigProps<unknown>
>;
