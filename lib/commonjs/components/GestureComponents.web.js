"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlatList = exports.DrawerLayoutAndroid = exports.TextInput = exports.Switch = exports.ScrollView = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _createNativeWrapper = _interopRequireDefault(require("../handlers/createNativeWrapper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const ScrollView = (0, _createNativeWrapper.default)(_reactNative.ScrollView, {
  disallowInterruption: true
});
exports.ScrollView = ScrollView;
const Switch = (0, _createNativeWrapper.default)(_reactNative.Switch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true
});
exports.Switch = Switch;
const TextInput = (0, _createNativeWrapper.default)(_reactNative.TextInput);
exports.TextInput = TextInput;
const DrawerLayoutAndroid = (0, _createNativeWrapper.default)(_reactNative.DrawerLayoutAndroid, {
  disallowInterruption: true
}); // @ts-ignore -- TODO(TS) to investigate if it's needed

exports.DrawerLayoutAndroid = DrawerLayoutAndroid;
DrawerLayoutAndroid.positions = _reactNative.DrawerLayoutAndroid.positions;
const FlatList = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(_reactNative.FlatList, _extends({
  ref: ref
}, props, {
  renderScrollComponent: scrollProps => /*#__PURE__*/React.createElement(ScrollView, scrollProps)
})));
exports.FlatList = FlatList;
//# sourceMappingURL=GestureComponents.web.js.map