"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = GestureHandlerRootView;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const GestureHandlerRootViewNative = (0, _reactNative.requireNativeComponent)('GestureHandlerRootView');

function GestureHandlerRootView({
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(GestureHandlerRootViewNative, rest, children);
}
//# sourceMappingURL=GestureHandlerRootView.android.js.map