export const TEST_MIN_IF_NOT_NAN = (value: number, limit: number): boolean =>
  !Number.isNaN(limit) &&
  ((limit < 0 && value <= limit) || (limit >= 0 && value >= limit));

export const TEST_MAX_IF_NOT_NAN = (value: number, max: number): boolean =>
  !Number.isNaN(max) && ((max < 0 && value < max) || (max >= 0 && value > max));

export const VECTOR_LENGTH_SQUARED = ({ x = 0, y = 0 }): number =>
  x * x + y * y;

export function fireAfterInterval(
  method: () => void,
  interval?: number | boolean
) {
  if (!interval) {
    method();
    return null;
  }
  return setTimeout(() => method(), interval as number);
}
