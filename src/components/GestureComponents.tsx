import React from 'react';
import ReactNative from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';

const MEMOIZED = new WeakMap();

function memoizeWrap(Component, config) {
  if (Component == null) {
    return null;
  }
  let memoized = MEMOIZED.get(Component);
  if (!memoized) {
    memoized = createNativeWrapper(Component, config);
    MEMOIZED.set(Component, memoized);
  }
  return memoized;
}

/* GESTURE HANDLER WRAPPED CLASSES */

export class ScrollView extends React.Component<
  NativeViewGestureHandlerProperties & ScrollViewProperties
> {
  scrollTo(y?: number | { x?: number; y?: number; animated?: boolean }, x?: number, animated?: boolean): void;
  scrollToEnd(options?: { animated: boolean }): void;
}

export class Switch extends React.Component<
  NativeViewGestureHandlerProperties & SwitchProperties
> {}

export class TextInput extends React.Component<
  NativeViewGestureHandlerProperties & TextInputProperties
> {}

export class DrawerLayoutAndroid extends React.Component<
  NativeViewGestureHandlerProperties & DrawerLayoutAndroidProperties
> {}

/* OTHER */

export class FlatList<ItemT> extends React.Component<
  NativeViewGestureHandlerProperties & FlatListProperties<ItemT>
> {
  scrollToEnd: (params?: { animated?: boolean }) => void;
  scrollToIndex: (params: { animated?: boolean; index: number; viewOffset?: number; viewPosition?: number }) => void;
  scrollToItem: (params: { animated?: boolean; item: ItemT; viewPosition?: number }) => void;
  scrollToOffset: (params: { animated?: boolean; offset: number }) => void;
}


module.exports = {
  /* RN's components */
  get ScrollView() {
    return memoizeWrap(ReactNative.ScrollView, {
      disallowInterruption: true,
      shouldCancelWhenOutside: false,
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
