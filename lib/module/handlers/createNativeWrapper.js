function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { NativeViewGestureHandler, nativeViewProps } from './NativeViewGestureHandler';
/*
 * This array should consist of:
 *   - All keys in propTypes from NativeGestureHandler
 *     (and all keys in GestureHandlerPropTypes)
 *   - 'onGestureHandlerEvent'
 *   - 'onGestureHandlerStateChange'
 */

const NATIVE_WRAPPER_PROPS_FILTER = [...nativeViewProps, 'onGestureHandlerEvent', 'onGestureHandlerStateChange'];
export default function createNativeWrapper(Component, config = {}) {
  const ComponentWrapper = /*#__PURE__*/React.forwardRef((props, ref) => {
    // filter out props that should be passed to gesture handler wrapper
    const gestureHandlerProps = Object.keys(props).reduce((res, key) => {
      // TS being overly protective with it's types, see https://github.com/microsoft/TypeScript/issues/26255#issuecomment-458013731 for more info
      const allowedKeys = NATIVE_WRAPPER_PROPS_FILTER;

      if (allowedKeys.includes(key)) {
        // @ts-ignore FIXME(TS)
        res[key] = props[key];
      }

      return res;
    }, { ...config
    } // watch out not to modify config
    );

    const _ref = useRef();

    const _gestureHandlerRef = useRef();

    useImperativeHandle(ref, // @ts-ignore TODO(TS) decide how nulls work in this context
    () => {
      const node = _gestureHandlerRef.current; // add handlerTag for relations config

      if (_ref.current && node) {
        // @ts-ignore FIXME(TS) think about createHandler return type
        _ref.current.handlerTag = node.handlerTag;
        return _ref.current;
      }

      return null;
    }, [_ref, _gestureHandlerRef]);
    return /*#__PURE__*/React.createElement(NativeViewGestureHandler, _extends({}, gestureHandlerProps, {
      // @ts-ignore TODO(TS)
      ref: _gestureHandlerRef
    }), /*#__PURE__*/React.createElement(Component, _extends({}, props, {
      ref: _ref
    })));
  });
  ComponentWrapper.displayName = Component.displayName || 'ComponentWrapper';
  return ComponentWrapper;
}
//# sourceMappingURL=createNativeWrapper.js.map