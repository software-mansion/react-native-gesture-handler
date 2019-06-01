import React from 'react';
import ReactNative from 'react-native';

import createNativeWrapper from './createNativeWrapper';

const MEMOIZED = {};

function memoizeWrap(Component, config) {
  const memoized = MEMOIZED[Component.displayName];
  if (memoized) {
    return memoized;
  }
  return (MEMOIZED[Component.displayName] = createNativeWrapper(
    Component,
    config
  ));
}

module.exports = {
  /* RN's components */
  get ScrollView() {
    return memoizeWrap(ReactNative.ScrollView, {
      disallowInterruption: true,
    });
  },
  get Switch() {
    return memoizeWrap(ReactNative.Switch, {
      shouldCancelWhenOutside: false,
      shouldActivateOnStart: true,
      disallowInterruption: true,
    });
  },
  get TextInput() {
    return memoizeWrap(ReactNative.TextInput);
  },
  get ToolbarAndroid() {
    return memoizeWrap(ReactNative.ToolbarAndroid);
  },
  get DrawerLayoutAndroid() {
    const DrawerLayoutAndroid = memoizeWrap(ReactNative.DrawerLayoutAndroid, {
      disallowInterruption: true,
    });
    DrawerLayoutAndroid.positions = ReactNative.DrawerLayoutAndroid.positions;
    return DrawerLayoutAndroid;
  },
  get FlatList() {
    if (!MEMOIZED.FlatList) {
      const ScrollView = this.ScrollView;
      MEMOIZED.FlatList = React.forwardRef((props, ref) => (
        <ReactNative.FlatList
          ref={ref}
          {...props}
          renderScrollComponent={scrollProps => <ScrollView {...scrollProps} />}
        />
      ));
    }
    return MEMOIZED.FlatList;
  },
};
