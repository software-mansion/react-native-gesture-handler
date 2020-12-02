export const isnan = (v: any) => Number.isNaN(v);

export const isValidNumber = (v: any) =>
  typeof v === 'number' && !Number.isNaN(v);

export const TEST_MIN_IF_NOT_NAN = (value: number, limit: any): boolean =>
  !isnan(limit) &&
  ((limit < 0 && value <= limit) || (limit >= 0 && value >= limit));
export const VEC_LEN_SQ = ({ x = 0, y = 0 } = {}) => x * x + y * y;
export const TEST_MAX_IF_NOT_NAN = (value: number, max: any) =>
  !isnan(max) && ((max < 0 && value < max) || (max >= 0 && value > max));

export function fireAfterInterval(method: () => any, interval: number) {
  if (!interval) {
    method();
    return null;
  }
  return setTimeout(() => method(), interval);
}
