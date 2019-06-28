let _gestureCache = {};

export function getHandler(tag) {
  if (tag in _gestureCache) return _gestureCache[tag];

  throw new Error('No handler for tag ' + tag);
}

export function createGestureHandler(handlerTag, handler) {
  if (handlerTag in _gestureCache) {
    throw new Error('Handler with tag ' + handlerTag + ' already exists');
  }
  _gestureCache[handlerTag] = handler;
  _gestureCache[handlerTag].handlerTag = handlerTag;
}

export function dropGestureHandler(handlerTag) {
  getHandler(handlerTag).destroy();
  delete _gestureCache[handlerTag];
}

export function getNodes() {
  return { ..._gestureCache };
}
