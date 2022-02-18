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

export function hasProperty(object: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function isJestEnv(): boolean {
  return !!process.env.JEST_WORKER_ID;
}
