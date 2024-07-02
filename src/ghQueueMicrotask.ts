// We check for typeof requestAnimationFrame because of SSR
export const ghQueueMicrotask =
  typeof requestAnimationFrame === "function"
    // Functions are bound to null to avoid issues with scope when using Metro inline requires.
    ? requestAnimationFrame.bind(null)
    : queueMicrotask.bind(null);
