let gestures = {};

export function getHandler(tag) {
  if (tag in gestures) return gestures[tag];

  throw new Error('No handler for tag ' + tag);
}

export function createGestureHandler(handlerTag, handler) {
  if (handlerTag in gestures) {
    throw new Error('Handler with tag ' + handlerTag + ' already exists');
  }
  gestures[handlerTag] = handler;
  gestures[handlerTag].handlerTag = handlerTag;
}

export function dropGestureHandler(handlerTag) {
  getHandler(handlerTag).destroy();
  delete gestures[handlerTag];
}

export function getNodes() {
  return { ...gestures };
}
