"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GesturePropError = void 0;

class GesturePropError extends Error {
  constructor(name, value, expectedType) {
    super(`Invalid property \`${name}: ${value}\` expected \`${expectedType}\``);
  }

}

exports.GesturePropError = GesturePropError;
//# sourceMappingURL=Errors.js.map