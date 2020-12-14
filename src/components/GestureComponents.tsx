import React from 'react';
import ReactNative, {
  ScrollViewProps,
  SwitchProps,
  TextInputProps,
  DrawerLayoutAndroidProps,
  FlatListProps,
  FlatList,
} from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';

import { NativeViewGestureHandlerProperties } from '../handlers/NativeViewGestureHandler';

const MEMOIZED = new WeakMap();

function memoizeWrap<P extends NativeViewGestureHandlerProperties>(
  Component: React.ComponentType<P>,
  config?: Record<string, unknown>
) {
  if (Component == null) {
    return null;
  }
  let memoized = MEMOIZED.get(Component);
  if (!memoized) {
    memoized = createNativeWrapper<P>(Component, config);
    MEMOIZED.set(Component, memoized);
  }
  return memoized;
}

type ScrollViewType = React.Component<
  NativeViewGestureHandlerProperties & ScrollViewProps
>;
type SwitchType = React.Component<
  NativeViewGestureHandlerProperties & SwitchProps
>;
type TextInputType = React.Component<
  NativeViewGestureHandlerProperties & TextInputProps
>;
type DrawerLayoutAndroidType = React.Component<
  NativeViewGestureHandlerProperties & DrawerLayoutAndroidProps
>;
type FlatListType<ItemT> = React.Component<
  NativeViewGestureHandlerProperties & FlatListProps<ItemT>
>;

// eslint-disable-next-line import/no-commonjs
module.exports = {
  /* RN's components */
  get ScrollView(): ScrollViewType | null {
    return memoizeWrap<ScrollViewProps>(ReactNative.ScrollView, {
      disallowInterruption: true,
      shouldCancelWhenOutside: false,
    });
  },
  get Switch(): SwitchType | null {
    return memoizeWrap<SwitchProps>(ReactNative.Switch, {
      shouldCancelWhenOutside: false,
      shouldActivateOnStart: true,
      disallowInterruption: true,
    });
  },
  get TextInput(): TextInputType {
    return memoizeWrap<TextInputProps>(ReactNative.TextInput);
  },
  get DrawerLayoutAndroid(): DrawerLayoutAndroidType {
    const DrawerLayoutAndroid = memoizeWrap<DrawerLayoutAndroidProps>(
      ReactNative.DrawerLayoutAndroid,
      {
        disallowInterruption: true,
      }
    );
    // we use literal object since TS gives error when using RN's `positions`
    DrawerLayoutAndroid.positions = { Left: 'left', Right: 'right' };
    return DrawerLayoutAndroid;
  },

  // TODO: get this type somehow
  // @ts-ignore
  get FlatList<ItemT>(): FlatListType<ItemT> | null {
    let memoized = MEMOIZED.get(ReactNative.FlatList);
    if (!memoized) {
      const ScrollView = this.ScrollView;
      memoized = React.forwardRef<FlatList<ItemT>, FlatListProps<ItemT>>(
        (props, ref) => (
          <ReactNative.FlatList
            ref={ref}
            {...props}
            renderScrollComponent={(scrollProps) => (
              <ScrollView {...scrollProps} />
            )}
          />
        )
      );
      MEMOIZED.set(ReactNative.FlatList, memoized);
    }
    return memoized;
  },
};
