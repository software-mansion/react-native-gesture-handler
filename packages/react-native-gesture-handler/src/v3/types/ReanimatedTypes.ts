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

// Utility type that turns `T` into `T | SharedValue<T>`. `P` is used to avoid splitting union types.
export type SharedValueOrT<T, P = never> =
  // We always want to get `T` in the resulting type.
  | T
  // If `T` is one of the types in `P`, we don't want to split the union, so we return SharedValue<T>.
  | (Exclude<T, undefined> extends P
      ? SharedValue<Exclude<T, undefined>>
      : // If `T` is not in `P`, we want to split the union and wrap each member with SharedValue, using Distributive Conditional Types (https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types).
        T extends any
        ? // Wrap each member of the union with SharedValue.
          SharedValue<Exclude<T, undefined>>
        : // If `T` is only one type, just return SharedValue<T>.
          SharedValue<Exclude<T, undefined>>);

// Utility type that decides whether to recurse for objects or apply SharedValue directly.
export type WithSharedValue<T, P = never> = T extends object
  ? WithSharedValueRecursive<T, P>
  : Simplify<SharedValueOrT<T, P>>;

// Apply SharedValue recursively. P is used to make sure that composed types won't be expanded.
// For example, if we pass `HoverEffect` as P, then resulting type will have HoverEffect | SharedValue<HoverEffect>,
// not HoverEffect, SharedValue<HoverEffect.NONE>, ...
type WithSharedValueRecursive<T extends object, P> = {
  [K in keyof T]: Exclude<T[K], undefined> extends P
    ? Simplify<SharedValueOrT<T[K], P>>
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
