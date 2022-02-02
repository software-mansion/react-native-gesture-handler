export const handlerIDToTag = {};
const handlers = new Map();
let handlerTag = 1;
export function getNextHandlerTag() {
  return handlerTag++;
}
export function registerHandler(handlerTag, handler) {
  handlers.set(handlerTag, handler);
}
export function unregisterHandler(handlerTag) {
  handlers.delete(handlerTag);
}
export function findHandler(handlerTag) {
  return handlers.get(handlerTag);
}
//# sourceMappingURL=handlersRegistry.js.map