import type {
  ForwardedRef,
  PropsWithChildren,
  ReactElement,
  RefAttributes,
} from 'react';
import * as React from 'react';
import type {
  DrawerLayoutAndroidProps as RNDrawerLayoutAndroidProps,
  FlatListProps as RNFlatListProps,
  ScrollViewProps as RNScrollViewProps,
  SwitchProps as RNSwitchProps,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import {
  DrawerLayoutAndroid as RNDrawerLayoutAndroid,
  FlatList as RNFlatList,
  RefreshControl as RNRefreshControl,
  ScrollView as RNScrollView,
  Switch as RNSwitch,
  TextInput as RNTextInput,
} from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';
import type { NativeViewGestureHandlerProps } from '../handlers/NativeViewGestureHandler';
import { nativeViewProps } from '../handlers/NativeViewGestureHandler';
import { toArray } from '../utils';

/**
 * @deprecated use `RefreshControl` instead
 */
export const LegacyRefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyRefreshControl = typeof LegacyRefreshControl &
  RNRefreshControl;

const GHScrollView = createNativeWrapper<PropsWithChildren<RNScrollViewProps>>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  }
);

/**
 * @deprecated use `ScrollView` instead
 */
export const LegacyScrollView = React.forwardRef<
  RNScrollView,
  RNScrollViewProps & NativeViewGestureHandlerProps
>((props, ref) => {
  const refreshControlGestureRef = React.useRef<LegacyRefreshControl>(null);
  const { refreshControl, waitFor, ...rest } = props;

  return (
    <GHScrollView
      {...rest}
      // @ts-ignore `ref` exists on `GHScrollView`
      ref={ref}
      waitFor={[...toArray(waitFor ?? []), refreshControlGestureRef]}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(refreshControl, {
              // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
              ref: refreshControlGestureRef,
            })
          : undefined
      }
    />
  );
});

// Backward type compatibility with https://github.com/software-mansion/react-native-gesture-handler/blob/db78d3ca7d48e8ba57482d3fe9b0a15aa79d9932/react-native-gesture-handler.d.ts#L440-L457
// include methods of wrapped components by creating an intersection type with the RN component instead of duplicating them.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyScrollView = typeof GHScrollView & RNScrollView;

/**
 * @deprecated use `Switch` instead
 */
export const LegacySwitch = createNativeWrapper<RNSwitchProps>(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacySwitch = typeof LegacySwitch & RNSwitch;

/**
 * @deprecated use `RefreshControl` instead
 */
export const LegacyTextInput =
  createNativeWrapper<RNTextInputProps>(RNTextInput);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyTextInput = typeof LegacyTextInput & RNTextInput;

/**
 * @deprecated use `DrawerLayoutAndroid` instead
 */
export const LegacyDrawerLayoutAndroid = createNativeWrapper<
  PropsWithChildren<RNDrawerLayoutAndroidProps>
>(RNDrawerLayoutAndroid, { disallowInterruption: true });
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyDrawerLayoutAndroid = typeof LegacyDrawerLayoutAndroid &
  RNDrawerLayoutAndroid;

/**
 * @deprecated use `FlatList` instead
 */
export const LegacyFlatList = React.forwardRef((props, ref) => {
  const refreshControlGestureRef = React.useRef<LegacyRefreshControl>(null);

  const { waitFor, refreshControl, ...rest } = props;

  const flatListProps = {};
  const scrollViewProps = {};
  for (const [propName, value] of Object.entries(rest)) {
    // https://github.com/microsoft/TypeScript/issues/26255
    if ((nativeViewProps as readonly string[]).includes(propName)) {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      scrollViewProps[propName] = value;
    } else {
      // @ts-ignore - this function cannot have generic type so we have to ignore this error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      flatListProps[propName] = value;
    }
  }

  return (
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    <RNFlatList
      ref={ref}
      {...flatListProps}
      renderScrollComponent={(scrollProps) => (
        <LegacyScrollView
          {...{
            ...scrollProps,
            ...scrollViewProps,
            waitFor: [...toArray(waitFor ?? []), refreshControlGestureRef],
          }}
        />
      )}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(refreshControl, {
              // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
              ref: refreshControlGestureRef,
            })
          : undefined
      }
    />
  );
}) as <ItemT = any>(
  props: PropsWithChildren<
    Omit<RNFlatListProps<ItemT>, 'renderScrollComponent'> &
      RefAttributes<LegacyFlatList<ItemT>> &
      NativeViewGestureHandlerProps
  >,
  ref?: ForwardedRef<LegacyFlatList<ItemT>>
) => ReactElement | null;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LegacyFlatList<ItemT = any> = typeof LegacyFlatList &
  RNFlatList<ItemT>;
