export function toArray<T>(object: T | T[]): T[] {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

export type withPrevAndCurrentMapFn<T, Transformed> = (
  previous: Transformed | null,
  current: T
) => Transformed;
export function withPrevAndCurrent<T, Transformed>(
  array: T[],
  mapFn: withPrevAndCurrentMapFn<T, Transformed>
): Transformed[] {
  const previousArr: (null | Transformed)[] = [null];
  const currentArr = [...array];
  const transformedArr: Transformed[] = [];
  currentArr.forEach((current, i) => {
    // This type cast is fine and solves problem mentioned in https://github.com/software-mansion/react-native-gesture-handler/pull/2867 (namely that `previous` can be undefined).
    // Unfortunately, linter on our CI does not allow this type of casting as it is unnecessary. To bypass that we use eslint-disable.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const previous = previousArr[i] as Transformed | null;
    const transformed = mapFn(previous, current);
    previousArr.push(transformed);
    transformedArr.push(transformed);
  });
  return transformedArr;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function hasProperty(object: object, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function isJestEnv(): boolean {
  // @ts-ignore Do not use `@types/node` because it will prioritise Node types over RN types which breaks the types (ex. setTimeout) in React Native projects.
  return hasProperty(global, 'process') && !!process.env.JEST_WORKER_ID;
}

export function tagMessage(msg: string) {
  return `[react-native-gesture-handler] ${msg}`;
}

// helper method to check whether Fabric is enabled, however global.nativeFabricUIManager
// may not be initialized before the first render
export function isFabric(): boolean {
  // @ts-expect-error nativeFabricUIManager is not yet included in the RN types
  return !!global?.nativeFabricUIManager;
}

export function isRemoteDebuggingEnabled(): boolean {
  // react-native-reanimated checks if in remote debugging in the same way
  // @ts-ignore global is available but node types are not included
  const localGlobal = global as any;
  return (
    (!localGlobal.nativeCallSyncHook || !!localGlobal.__REMOTEDEV__) &&
    !localGlobal.RN$Bridgeless
  );
}
