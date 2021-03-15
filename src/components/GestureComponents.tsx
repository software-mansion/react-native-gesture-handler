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

import { NativeViewGestureHandlerProps } from '../handlers/NativeViewGestureHandler';

export const ScrollView = createNativeWrapper<
  PropsWithChildren<RNScrollViewProps>
>(RNScrollView, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});
// backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// include methods of wrapped components by creating an intersection type with the RN component instead of duplicating them.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof ScrollView & RNScrollView;

export const Switch = createNativeWrapper<RNSwitchProps>(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch & RNSwitch;

export const TextInput = createNativeWrapper<RNTextInputProps>(RNTextInput);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof TextInput & RNTextInput;

export const DrawerLayoutAndroid = createNativeWrapper<
  PropsWithChildren<RNDrawerLayoutAndroidProps>
>(RNDrawerLayoutAndroid, { disallowInterruption: true });
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawerLayoutAndroid = typeof DrawerLayoutAndroid &
  RNDrawerLayoutAndroid;

export const FlatList = React.forwardRef((props, ref) => (
  <RNFlatList
    ref={ref}
    {...props}
    renderScrollComponent={(scrollProps) => <ScrollView {...scrollProps} />}
  />
)) as <ItemT = any>(
  props: PropsWithChildren<
    RNFlatListProps<ItemT> &
      RefAttributes<FlatList<ItemT>> &
      NativeViewGestureHandlerProps
  >,
  ref: ForwardedRef<FlatList<ItemT>>
) => ReactElement | null;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT = any> = typeof FlatList & RNFlatList<ItemT>;
