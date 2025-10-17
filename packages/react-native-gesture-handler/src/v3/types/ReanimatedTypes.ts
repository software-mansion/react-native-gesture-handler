export type SharedValue<Value = unknown> = {
  value: Value;
  get(): Value;
  set(value: Value | ((value: Value) => Value)): void;
  addListener: (listenerID: number, listener: (value: Value) => void) => void;
  removeListener: (listenerID: number) => void;
  modify: (
    modifier?: <T extends Value>(value: T) => T,
    forceUpdate?: boolean
  ) => void;
};

export type SharedValueOrT<T> = T | SharedValue<Exclude<T, undefined>>;

// Utility type that decides whether to recurse for objects or apply SharedValue directly.
export type WithSharedValue<T, P = never> = T extends object
  ? WithSharedValueRecursive<T, P>
  : Simplify<SharedValueOrT<T>>;

// Apply SharedValue recursively. P is used to make sure that composed types won't be expanded.
// For example, if we pass `HoverEffect` as P, then resulting type will have HoverEffect | SharedValue<HoverEffect>,
// not HoverEffect, SharedValue<HoverEffect.NONE>, ...
type WithSharedValueRecursive<T extends object, P> = {
  [K in keyof T]: Exclude<T[K], undefined> extends P
    ? Simplify<SharedValueOrT<T[K]>>
    : // Special case for boolean as passing `boolean` as P doesn't look ok.
      boolean extends T[K]
      ? boolean | SharedValue<boolean>
      : // Special handling for tuples [number, number].
        T[K] extends [number, number]
        ? [WithSharedValue<number, P>, WithSharedValue<number, P>]
        : // Default case: apply the MaybeWithSharedValue logic recursively or as a direct SharedValue wrap.
          WithSharedValue<T[K], P>;
};

// Simplifies types for end users.
// For example, changes SharedValueOrT<number> into number | SharedValue<number>.
type Simplify<T> =
  T extends SharedValue<never>
    ? never
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T extends SharedValue<any>
      ? T
      : {
          // For a generic object, retain the original structure while forcing an object type
          [K in keyof T]: T[K];
        } & NonNullable<unknown>;
