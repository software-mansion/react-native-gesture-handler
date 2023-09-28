export const ghQueueMicrotask = (callbackFn: () => void) => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callbackFn);
  } else {
    setImmediate(callbackFn);
  }
};
