"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = gestureHandlerRootHOC;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _GestureHandlerRootView = _interopRequireDefault(require("./GestureHandlerRootView"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function gestureHandlerRootHOC(Component, containerStyles) {
  function Wrapper(props) {
    return /*#__PURE__*/React.createElement(_GestureHandlerRootView.default, {
      style: [styles.container, containerStyles]
    }, /*#__PURE__*/React.createElement(Component, props));
  }

  Wrapper.displayName = `gestureHandlerRootHOC(${Component.displayName || Component.name})`;
  (0, _hoistNonReactStatics.default)(Wrapper, Component);
  return Wrapper;
}

const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=gestureHandlerRootHOC.js.map