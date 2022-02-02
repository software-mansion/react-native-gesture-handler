"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNextHandlerTag = getNextHandlerTag;
exports.registerHandler = registerHandler;
exports.unregisterHandler = unregisterHandler;
exports.findHandler = findHandler;
exports.handlerIDToTag = void 0;
const handlerIDToTag = {};
exports.handlerIDToTag = handlerIDToTag;
const handlers = new Map();
let handlerTag = 1;

function getNextHandlerTag() {
  return handlerTag++;
}

function registerHandler(handlerTag, handler) {
  handlers.set(handlerTag, handler);
}

function unregisterHandler(handlerTag) {
  handlers.delete(handlerTag);
}

function findHandler(handlerTag) {
  return handlers.get(handlerTag);
}
//# sourceMappingURL=handlersRegistry.js.map