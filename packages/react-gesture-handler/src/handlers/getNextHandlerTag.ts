let handlerTag = 1;

export function getNextHandlerTag(): number {
  return handlerTag++;
}
