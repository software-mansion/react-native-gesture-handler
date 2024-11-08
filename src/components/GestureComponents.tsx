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
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';

import {
  NativeViewGestureHandler,
  NativeViewGestureHandlerProps,
  nativeViewProps,
} from '../handlers/NativeViewGestureHandler';

import { toArray } from '../utils';
import { State } from '../State';
import type { HandlerStateChangeEvent } from '../handlers/gestureHandlerCommon';
import type { NativeViewGestureHandlerPayload } from '../handlers/GestureHandlerEventPayload';

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
export const ScrollView = React.forwardRef<
  RNScrollView,
  RNScrollViewProps & NativeViewGestureHandlerProps
>((props, ref) => {
  const refreshControlGestureRef = React.useRef<RefreshControl>(null);
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

type TextProps = Omit<RNTextProps, 'onPress'> & {
  onPress?: (
    event: HandlerStateChangeEvent<NativeViewGestureHandlerPayload>
  ) => void;
};

export const Text = (props: TextProps) => {
  const { children, onPress, ...rest } = props;
  return (
    <NativeViewGestureHandler
      onHandlerStateChange={(event) => {
        if (
          event.nativeEvent.oldState === State.ACTIVE &&
          event.nativeEvent.state === State.END
        ) {
          onPress?.(event);
        }
      }}>
      <RNText {...rest}>{children}</RNText>
    </NativeViewGestureHandler>
  );
};
export type Text = typeof Text & RNText;

export const DrawerLayoutAndroid = createNativeWrapper<
  PropsWithChildren<RNDrawerLayoutAndroidProps>
>(RNDrawerLayoutAndroid, { disallowInterruption: true });
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DrawerLayoutAndroid = typeof DrawerLayoutAndroid &
  RNDrawerLayoutAndroid;

export const FlatList = React.forwardRef((props, ref) => {
  const refreshControlGestureRef = React.useRef<RefreshControl>(null);

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
        <ScrollView
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
      RefAttributes<FlatList<ItemT>> &
      NativeViewGestureHandlerProps
  >,
  ref: ForwardedRef<FlatList<ItemT>>
) => ReactElement | null;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT = any> = typeof FlatList & RNFlatList<ItemT>;
