// We check for typeof requestAnimationFrame because of SSR
export const ghQueueMicrotask =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : queueMicrotask;
