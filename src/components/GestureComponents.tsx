import * as React from 'react';
import {
  PropsWithChildren,
  ForwardedRef,
  RefAttributes,
  ReactElement,
} from 'react';
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

export const ScrollView = createNativeWrapper<
  PropsWithChildren<RNScrollViewProps>
>(RNScrollView, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});
// backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof RNScrollView & RNScrollView;

export const Switch = createNativeWrapper<RNSwitchProps>(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof RNSwitch & RNSwitch;

export const TextInput = createNativeWrapper<RNTextInputProps>(RNTextInput);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof RNTextInput & RNTextInput;

export const DrawerLayoutAndroid = createNativeWrapper<
  PropsWithChildren<RNDrawerLayoutAndroidProps>
>(RNDrawerLayoutAndroid, { disallowInterruption: true });
// we use literal object since TS gives error when using RN's `positions`
// @ts-ignore FIXME(TS) maybe this should be removed?
DrawerLayoutAndroid.positions = { Left: 'left', Right: 'right' };
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawerLayoutAndroid = typeof RNDrawerLayoutAndroid &
  RNDrawerLayoutAndroid;

export const FlatList = React.forwardRef<RNFlatList<any>, RNFlatListProps<any>>(
  (props, ref) => (
    <RNFlatList
      ref={ref}
      {...props}
      renderScrollComponent={(scrollProps) => <ScrollView {...scrollProps} />}
    />
  )
) as <ItemT = any>(
  props: PropsWithChildren<RNFlatListProps<ItemT>> &
    RefAttributes<RNFlatList<ItemT>>,
  ref: ForwardedRef<RNFlatList<ItemT>>
) => ReactElement | null;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT = any> = RNFlatList<ItemT>;
