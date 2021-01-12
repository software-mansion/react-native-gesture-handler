import React from 'react';
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
  Switch as RNSwitch,
  SwitchProps as RNSwitchProps,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  DrawerLayoutAndroid as RNDrawerLayoutAndroid,
  DrawerLayoutAndroidProps as RNDrawerLayoutAndroidProps,
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
} from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';

import { NativeViewGestureHandlerProperties } from '../handlers/NativeViewGestureHandler';

const MEMOIZED = new WeakMap<
  React.ComponentType<any>,
  React.ForwardRefExoticComponent<any>
>();

function memoizeWrap<P>(
  Component: React.ComponentType<P>,
  config?: Readonly<NativeViewGestureHandlerProperties>
): React.ComponentType<
  P & NativeViewGestureHandlerProperties & React.RefAttributes<any>
> {
  let memoized = MEMOIZED.get(Component);
  if (!memoized) {
    memoized = createNativeWrapper<P>(Component, config);
    MEMOIZED.set(Component, memoized);
  }
  return memoized;
}

const GestureComponentWrappers = {
  /* RN's components */
  get ScrollView() {
    return memoizeWrap<RNScrollViewProps>(RNScrollView, {
      disallowInterruption: true,
      shouldCancelWhenOutside: false,
    });
  },
  get Switch() {
    return memoizeWrap<RNSwitchProps>(RNSwitch, {
      shouldCancelWhenOutside: false,
      shouldActivateOnStart: true,
      disallowInterruption: true,
    });
  },
  get TextInput() {
    return memoizeWrap<RNTextInputProps>(RNTextInput);
  },
  get DrawerLayoutAndroid() {
    const DrawerLayoutAndroid = memoizeWrap<RNDrawerLayoutAndroidProps>(
      RNDrawerLayoutAndroid,
      {
        disallowInterruption: true,
      }
    );
    // we use literal object since TS gives error when using RN's `positions`
    // @ts-ignore FIXME(TS) maybe this should be removed?
    DrawerLayoutAndroid.positions = { Left: 'left', Right: 'right' };
    return DrawerLayoutAndroid;
  },

  get FlatList<ItemT>() {
    let memoized = MEMOIZED.get(RNFlatList);
    if (!memoized) {
      const ScrollView = this.ScrollView;
      memoized = React.forwardRef<RNFlatList<any>, RNFlatListProps<any>>(
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
    return (memoized as unknown) as FlatList<ItemT>;
  },
};

// eslint-disable-next-line import/no-commonjs -- we have to use getters in order to run code memoizing components
module.exports = {
  get ScrollView() {
    return GestureComponentWrappers.ScrollView;
  },

  get Switch() {
    return GestureComponentWrappers.Switch;
  },
  get TextInput() {
    return GestureComponentWrappers.TextInput;
  },
  get DrawerLayoutAndroid() {
    return GestureComponentWrappers.DrawerLayoutAndroid;
  },

  get FlatList<ItemT>() {
    return (GestureComponentWrappers.FlatList as unknown) as FlatList<ItemT>;
  },
};

export const ScrollView = GestureComponentWrappers.ScrollView;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
export type ScrollView = typeof ScrollView & {
  scrollTo(
    y?: number | { x?: number; y?: number; animated?: boolean },
    x?: number,
    animated?: boolean
  ): void;
  scrollToEnd(options?: { animated: boolean }): void;
};
export const Switch = GestureComponentWrappers.Switch;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch;
export const TextInput = GestureComponentWrappers.TextInput;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof TextInput;
export const DrawerLayoutAndroid = GestureComponentWrappers.DrawerLayoutAndroid;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawerLayoutAndroid = typeof DrawerLayoutAndroid;
export const FlatList = GestureComponentWrappers.FlatList;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT> = React.ComponentClass<
  RNFlatList<ItemT> &
    NativeViewGestureHandlerProperties &
    React.RefAttributes<any>
> & {
  scrollToEnd: (params?: { animated?: boolean }) => void;
  scrollToIndex: (params: {
    animated?: boolean;
    index: number;
    viewOffset?: number;
    viewPosition?: number;
  }) => void;
  scrollToItem: (params: {
    animated?: boolean;
    item: ItemT;
    viewPosition?: number;
  }) => void;
  scrollToOffset: (params: { animated?: boolean; offset: number }) => void;
};
