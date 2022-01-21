export function toArray<T>(object: T | T[]): T[] {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

export function withPrevAndCurrent<T>(
  mapFn: (previous: T | null, current: T) => T
) {
  return (currentElement: T, i: number, array: T[]) => {
    const previousElement = i > 0 ? array[i - 1] : null;
    return mapFn(previousElement, currentElement);
  };
}
