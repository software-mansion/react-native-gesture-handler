"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = toArray;

function toArray(object) {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}
//# sourceMappingURL=utils.js.map