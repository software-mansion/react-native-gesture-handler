export function toArray<T>(object: T | T[]): T[] {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

export function isJest(): boolean {
  return !!process.env.JEST_WORKER_ID;
}
