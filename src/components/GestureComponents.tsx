import * as React from 'react';
import { PropsWithChildren } from 'react';
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

import { NativeViewGestureHandlerProps } from '../handlers/NativeViewGestureHandler';

export const ScrollView = createNativeWrapper<
  PropsWithChildren<RNScrollViewProps>
>(RNScrollView, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});
// backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof ScrollView & {
  scrollTo(
    y?: number | { x?: number; y?: number; animated?: boolean },
    x?: number,
    animated?: boolean
  ): void;
  scrollToEnd(options?: { animated: boolean }): void;
};

export const Switch = createNativeWrapper<RNSwitchProps>(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch;

export const TextInput = createNativeWrapper<RNTextInputProps>(RNTextInput);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof TextInput;

export const DrawerLayoutAndroid = createNativeWrapper<
  PropsWithChildren<RNDrawerLayoutAndroidProps>
>(RNDrawerLayoutAndroid, { disallowInterruption: true });
// we use literal object since TS gives error when using RN's `positions`
// @ts-ignore FIXME(TS) maybe this should be removed?
DrawerLayoutAndroid.positions = { Left: 'left', Right: 'right' };
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawerLayoutAndroid = typeof DrawerLayoutAndroid;

export const FlatList = React.forwardRef<RNFlatList<any>, RNFlatListProps<any>>(
  (props, ref) => (
    <RNFlatList
      ref={ref}
      {...props}
      renderScrollComponent={(scrollProps) => <ScrollView {...scrollProps} />}
    />
  )
);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT> = React.ComponentType<
  RNFlatListProps<ItemT> &
    NativeViewGestureHandlerProps &
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
