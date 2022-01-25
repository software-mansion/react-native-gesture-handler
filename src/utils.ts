export function toArray<T>(object: T | T[]): T[] {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

/**
 * Used with reduce on lists, without initialValue specified
 * @param mapFn function returning next element based on previous and current one
 * @returns list of transformed elements
 */

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
