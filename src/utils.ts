export function toArray<T>(object: T | T[]): T[] {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

export function isJest(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !!process.env.JEST_WORKER_ID;
}
