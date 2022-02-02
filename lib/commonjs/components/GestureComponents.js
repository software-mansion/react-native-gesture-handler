"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlatList = exports.DrawerLayoutAndroid = exports.TextInput = exports.Switch = exports.ScrollView = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _createNativeWrapper = _interopRequireDefault(require("../handlers/createNativeWrapper"));

var _NativeViewGestureHandler = require("../handlers/NativeViewGestureHandler");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const ScrollView = (0, _createNativeWrapper.default)(_reactNative.ScrollView, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false
}); // backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// include methods of wrapped components by creating an intersection type with the RN component instead of duplicating them.
// eslint-disable-next-line @typescript-eslint/no-redeclare

exports.ScrollView = ScrollView;
const Switch = (0, _createNativeWrapper.default)(_reactNative.Switch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true
}); // eslint-disable-next-line @typescript-eslint/no-redeclare

exports.Switch = Switch;
const TextInput = (0, _createNativeWrapper.default)(_reactNative.TextInput); // eslint-disable-next-line @typescript-eslint/no-redeclare

exports.TextInput = TextInput;
const DrawerLayoutAndroid = (0, _createNativeWrapper.default)(_reactNative.DrawerLayoutAndroid, {
  disallowInterruption: true
}); // eslint-disable-next-line @typescript-eslint/no-redeclare

exports.DrawerLayoutAndroid = DrawerLayoutAndroid;
const FlatList = /*#__PURE__*/React.forwardRef((props, ref) => {
  const flatListProps = {};
  const scrollViewProps = {};

  for (const [propName, value] of Object.entries(props)) {
    // https://github.com/microsoft/TypeScript/issues/26255
    if (_NativeViewGestureHandler.nativeViewProps.includes(propName)) {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      scrollViewProps[propName] = value;
    } else {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      flatListProps[propName] = value;
    }
  }

  return (
    /*#__PURE__*/
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    React.createElement(_reactNative.FlatList, _extends({
      ref: ref
    }, flatListProps, {
      renderScrollComponent: scrollProps => /*#__PURE__*/React.createElement(ScrollView, _extends({}, scrollProps, scrollViewProps))
    }))
  );
}); // eslint-disable-next-line @typescript-eslint/no-redeclare

exports.FlatList = FlatList;
//# sourceMappingURL=GestureComponents.js.map