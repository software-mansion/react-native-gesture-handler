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
  return hasProperty(global, 'process') && !!process.env.JEST_WORKER_ID;
}

export function tagMessage(msg: string) {
  return `[react-native-gesture-handler] ${msg}`;
}

export function isFabric(): boolean {
  // @ts-expect-error nativeFabricUIManager is not yet included in the RN types
  return !!global?.nativeFabricUIManager;
}
