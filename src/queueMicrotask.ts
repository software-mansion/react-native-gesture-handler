export const ghQueueMicrotask =
  typeof queueMicrotask === 'function' ? queueMicrotask : setImmediate;
