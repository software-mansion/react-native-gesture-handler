import pack from 'react-native/package.json';

const [majorStr, minorStr] = pack.version.split('.');
export const REACT_NATIVE_VERSION = {
  major: parseInt(majorStr, 10),
  minor: parseInt(minorStr, 10),
};

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
    const previous = previousArr[i];
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

export function shouldUseCodegenNativeComponent(): boolean {
  // use codegenNativeComponent starting with RN 0.68
  return REACT_NATIVE_VERSION.minor >= 68 || REACT_NATIVE_VERSION.major > 0;
}

export function isRemoteDebuggingEnabled(): boolean {
  // react-native-reanimated checks if in remote debugging in the same way
  // @ts-ignore global is available but node types are not included
  return !(global as any).nativeCallSyncHook || (global as any).__REMOTEDEV__;
}
