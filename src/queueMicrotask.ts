export const ghQueueMicrotask = (callbackFn: () => void) => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callbackFn);
  } else {
    Promise.resolve().then(callbackFn);
  }
};
