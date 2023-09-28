export const ghQueueMicrotask = (callbackFn: () => void) => {
  if (queueMicrotask) {
    queueMicrotask(callbackFn);
  } else {
    Promise.resolve().then(callbackFn);
  }
};
