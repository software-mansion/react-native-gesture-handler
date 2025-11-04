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
  RefreshControl as RNRefreshControl,
} from 'react-native';

import createNativeWrapper, {
  ComponentWrapperRef,
} from '../v3/createNativeWrapper';

import { NativeWrapperProperties } from '../v3/types/NativeWrapperType';
import { NativeWrapperProps } from '../v3/hooks/utils';
import { AnyGesture } from '../v3/types';

export const RefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type RefreshControl = typeof RefreshControl & RNRefreshControl;

const GHScrollView = createNativeWrapper<PropsWithChildren<RNScrollViewProps>>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  }
);
export const ScrollView = (
  props: RNScrollViewProps & NativeWrapperProperties
) => {
  const refreshControlRef =
    React.useRef<ComponentWrapperRef<RefreshControl>>(null);
  const { refreshControl, requireExternalGestureToFail, ...rest } = props;

  const waitFor = [];

  if (Array.isArray(requireExternalGestureToFail)) {
    waitFor.push(...requireExternalGestureToFail);
  } else if (requireExternalGestureToFail) {
    waitFor.push(requireExternalGestureToFail);
  }

  if (refreshControlRef.current) {
    waitFor.push(refreshControlRef.current.gestureRef);
  }

  return (
    <GHScrollView
      {...rest}
      // @ts-ignore `ref` exists on `GHScrollView`
      ref={props.ref}
      requireExternalGestureToFail={waitFor}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(refreshControl, {
              // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
              ref: refreshControlRef,
            })
          : undefined
      }
    />
  );
};
// Backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// include methods of wrapped components by creating an intersection type with the RN component instead of duplicating them.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof GHScrollView & RNScrollView;

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

export const FlatList = ((props) => {
  const refreshControlRef =
    React.useRef<ComponentWrapperRef<RefreshControl>>(null);

  const { requireExternalGestureToFail, refreshControl, ...rest } = props;

  const flatListProps = {};
  const scrollViewProps = {};
  for (const [propName, value] of Object.entries(rest)) {
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/26255
    if (NativeWrapperProps.has(propName)) {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      scrollViewProps[propName] = value;
    } else {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      flatListProps[propName] = value;
    }
  }

  const waitFor: AnyGesture[] = [];

  if (Array.isArray(requireExternalGestureToFail)) {
    waitFor.push(...requireExternalGestureToFail);
  } else if (requireExternalGestureToFail) {
    waitFor.push(requireExternalGestureToFail);
  }

  if (refreshControlRef.current) {
    waitFor.push(refreshControlRef.current.gestureRef);
  }

  return (
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    <RNFlatList
      ref={props.ref}
      {...flatListProps}
      renderScrollComponent={(scrollProps) => (
        <ScrollView
          {...{
            ...scrollProps,
            ...scrollViewProps,
            requireExternalGestureToFail: waitFor,
          }}
        />
      )}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(refreshControl, {
              // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
              ref: refreshControlRef,
            })
          : undefined
      }
    />
  );
}) as <ItemT = any>(
  props: PropsWithChildren<
    Omit<RNFlatListProps<ItemT>, 'renderScrollComponent'> &
      RefAttributes<FlatList<ItemT>> &
      NativeWrapperProperties
  >,
  ref?: ForwardedRef<FlatList<ItemT>>
) => ReactElement | null;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT = any> = typeof FlatList & RNFlatList<ItemT>;
