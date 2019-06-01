import React from 'react';

import NativeViewGestureHandler from './NativeViewGestureHandler';

const NATIVE_WRAPPER_BIND_BLACKLIST = new Set(['replaceState', 'isMounted']);

/*
 * This array should consist of:
 *   - All keys in propTypes from NativeGestureHandler
 *     (and all keys in GestureHandlerPropTypes)
 *   - 'onGestureHandlerEvent'
 *   - 'onGestureHandlerStateChange'
 */
const NATIVE_WRAPPER_PROPS_FILTER = [
  'id',
  'minPointers',
  'enabled',
  'waitFor',
  'simultaneousHandlers',
  'shouldCancelWhenOutside',
  'hitSlop',
  'onGestureEvent',
  'onHandlerStateChange',
  'onBegan',
  'onFailed',
  'onCancelled',
  'onActivated',
  'onEnded',
  'shouldActivateOnStart',
  'disallowInterruption',
  'onGestureHandlerEvent',
  'onGestureHandlerStateChange',
];

export default function createNativeWrapper(Component, config = {}) {
  class ComponentWrapper extends React.Component {
    static propTypes = {
      ...Component.propTypes,
    };

    static displayName = Component.displayName || 'ComponentWrapper';

    _refHandler = node => {
      // bind native component's methods
      let source = node;
      while (source != null) {
        for (let methodName of Object.getOwnPropertyNames(source)) {
          if (
            !methodName.startsWith('_') && // private methods
            !methodName.startsWith('component') && // lifecycle methods
            !NATIVE_WRAPPER_BIND_BLACKLIST.has(methodName) && // other
            typeof source[methodName] === 'function' &&
            this[methodName] === undefined
          ) {
            if (source[methodName].prototype) {
              // determine if it's not bound already
              this[methodName] = source[methodName].bind(node);
            } else {
              this[methodName] = source[methodName];
            }
          }
        }
        source = Object.getPrototypeOf(source);
      }
    };

    render() {
      // filter out props that should be passed to gesture handler wrapper
      const gestureHandlerProps = Object.keys(this.props).reduce(
        (props, key) => {
          if (NATIVE_WRAPPER_PROPS_FILTER.indexOf(key) !== -1) {
            props[key] = this.props[key];
          }
          return props;
        },
        { ...config } // watch out not to modify config
      );
      return (
        <NativeViewGestureHandler {...gestureHandlerProps}>
          <Component {...this.props} ref={this._refHandler} />
        </NativeViewGestureHandler>
      );
    }
  }
  return ComponentWrapper;
}
