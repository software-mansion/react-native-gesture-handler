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

/* RN's components */
function getScrollView() {
  return memoizeWrap<RNScrollViewProps>(RNScrollView, {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  });
}
function getSwitch() {
  return memoizeWrap<RNSwitchProps>(RNSwitch, {
    shouldCancelWhenOutside: false,
    shouldActivateOnStart: true,
    disallowInterruption: true,
  });
}
function getTextInput() {
  return memoizeWrap<RNTextInputProps>(RNTextInput);
}
function getDrawerLayoutAndroid() {
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
}
function getFlatList() {
  let memoized = MEMOIZED.get(RNFlatList);
  if (!memoized) {
    const ScrollView = getScrollView();
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
  return memoized;
}
// FIXME fix memoization
export const ScrollView = getScrollView();
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
export type ScrollView = typeof ScrollView & {
  scrollTo(
    y?: number | { x?: number; y?: number; animated?: boolean },
    x?: number,
    animated?: boolean
  ): void;
  scrollToEnd(options?: { animated: boolean }): void;
};
export const Switch = getSwitch();
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch;
export const TextInput = getTextInput();
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof TextInput;
export const DrawerLayoutAndroid = getDrawerLayoutAndroid();
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawerLayoutAndroid = typeof DrawerLayoutAndroid;
export const FlatList = (getFlatList() as unknown) as <
  ItemT
>() => FlatList<ItemT>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT> = React.ComponentType<
  RNFlatListProps<ItemT> &
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
