import React from 'react';
import {
  ScrollView as RNScrollView,
  ScrollViewProps,
  Switch as RNSwitch,
  SwitchProps,
  TextInput as RNTextInput,
  TextInputProps,
  DrawerLayoutAndroid as RNDrawerLayoutAndroid,
  DrawerLayoutAndroidProps,
  FlatList as RNFlatList,
  FlatListProps,
} from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';

import { NativeViewGestureHandlerProperties } from '../handlers/NativeViewGestureHandler';

const MEMOIZED = new WeakMap();

function memoizeWrap<P extends NativeViewGestureHandlerProperties>(
  Component: React.ComponentType<P>,
  config?: Record<string, unknown>
): React.ComponentType<P> | null {
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

const GestureComponentWrappers = {
  /* RN's components */
  get ScrollView(): ScrollViewType | null {
    return memoizeWrap<ScrollViewProps>(RNScrollView, {
      disallowInterruption: true,
      shouldCancelWhenOutside: false,
    });
  },
  get Switch(): SwitchType | null {
    return memoizeWrap<SwitchProps>(RNSwitch, {
      shouldCancelWhenOutside: false,
      shouldActivateOnStart: true,
      disallowInterruption: true,
    });
  },
  get TextInput(): TextInputType {
    return memoizeWrap<TextInputProps>(RNTextInput);
  },
  get DrawerLayoutAndroid(): DrawerLayoutAndroidType {
    const DrawerLayoutAndroid = memoizeWrap<DrawerLayoutAndroidProps>(
      RNDrawerLayoutAndroid,
      {
        disallowInterruption: true,
      }
    );
    // we use literal object since TS gives error when using RN's `positions`
    DrawerLayoutAndroid.positions = { Left: 'left', Right: 'right' };
    return DrawerLayoutAndroid;
  },

  // @ts-ignore get this type somehow
  get FlatList(): FlatListType<ItemT> | null {
    let memoized = MEMOIZED.get(RNFlatList);
    if (!memoized) {
      const ScrollView = this.ScrollView;
      memoized = React.forwardRef<RNFlatList<ItemT>, FlatListProps<ItemT>>(
        (props, ref) => (
          <RNFlatList
            ref={ref}
            {...props}
            renderScrollComponent={(scrollProps) => (
              <ScrollView {...scrollProps} />
            )}
          />
        )
      );
      MEMOIZED.set(RNFlatList, memoized);
    }
    return memoized;
  },
};

export const ScrollView = GestureComponentWrappers.ScrollView;
export const Switch = GestureComponentWrappers.Switch;
export const TextInput = GestureComponentWrappers.TextInput;
export const DrawerLayoutAndroid = GestureComponentWrappers.DrawerLayoutAndroid;
export const FlatList = GestureComponentWrappers.FlatList;
