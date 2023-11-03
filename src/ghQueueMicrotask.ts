// `queueMicrotask` was introduced to react-native in version 0.66 (https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0660)
// Because Gesture Handler supports versions 0.64+, we have to handle situations where someone uses older version of react native.
// That's why if `queueMicrotask` doesn't exist, we use `setImmediate` instead, since it was used before we switched to `queueMicrotask` in version 2.11.0
export const ghQueueMicrotask =
  typeof queueMicrotask === 'function' ? queueMicrotask : setImmediate;
