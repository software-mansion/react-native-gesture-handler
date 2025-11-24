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
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
  RefreshControl as RNRefreshControl,
} from 'react-native';

import createNativeWrapper, {
  ComponentWrapperRef,
} from '../createNativeWrapper';

import { NativeWrapperProperties } from '../types/NativeWrapperType';
import { NativeWrapperProps } from '../hooks/utils';
import { Gesture } from '../types';
import { DetectorType } from '../detectors';
import {
  NativeViewGestureConfig,
  NativeViewHandlerData,
} from '../hooks/gestures/native/useNativeGesture';

export const RefreshControl = createNativeWrapper(
  RNRefreshControl,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  DetectorType.Virtual
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type RefreshControl = typeof RefreshControl & RNRefreshControl;

const GHScrollView = createNativeWrapper<PropsWithChildren<RNScrollViewProps>>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  DetectorType.Intercepting
);

type ImperativeScrollViewRef = ComponentWrapperRef<RNScrollViewProps> | null;

export const ScrollView = (
  props: RNScrollViewProps &
    NativeWrapperProperties & {
      ref?: React.RefObject<ImperativeScrollViewRef>;
      // This prop existst because using `ref` in `renderScrollComponent` doesn't work.
      innerRef?: (node: ImperativeScrollViewRef) => void;
    }
) => {
  const { refreshControl, innerRef, ref, ...rest } = props;

  const [scrollGesture, setScrollGesture] = React.useState<Gesture<
    NativeViewHandlerData,
    NativeViewGestureConfig
  > | null>(null);

  const wrapperRef = React.useRef<ComponentWrapperRef<RNScrollViewProps>>(null);

  React.useImperativeHandle<ImperativeScrollViewRef, ImperativeScrollViewRef>(
    ref,
    () => wrapperRef.current
  );

  return (
    <GHScrollView
      {...rest}
      // @ts-ignore `ref` exists on `GHScrollView`
      ref={(node: ImperativeScrollViewRef) => {
        setScrollGesture(node?.gestureRef ?? null);
        wrapperRef.current = node;
        innerRef?.(node);
      }}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(
              refreshControl,
              // @ts-ignore block exists (on our RefreshControl)
              scrollGesture ? { block: scrollGesture } : {}
            )
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

type ImperativeFlatListRef =
  | (ComponentWrapperRef<RNScrollViewProps> & {
      flatListRef: React.RefObject<FlatList<any>>;
    })
  | null;

export const FlatList = ((props) => {
  const { refreshControl, ref, ...rest } = props;

  const [scrollGesture, setScrollGesture] = React.useState<Gesture<
    NativeViewHandlerData,
    NativeViewGestureConfig
  > | null>(null);

  const wrapperRef = React.useRef<ImperativeScrollViewRef>(null);
  const flatListRef = React.useRef<FlatList<any>>(null);

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

  React.useImperativeHandle<ImperativeFlatListRef, ImperativeFlatListRef>(
    // @ts-ignore We want to override ref
    ref,
    () => {
      return {
        ...wrapperRef.current,
        flatListRef: flatListRef.current,
      };
    }
  );

  return (
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    <RNFlatList
      ref={flatListRef}
      {...flatListProps}
      renderScrollComponent={(scrollProps) => (
        <ScrollView
          innerRef={(node: ImperativeScrollViewRef) => {
            setScrollGesture(node?.gestureRef ?? null);
            wrapperRef.current = node;
          }}
          {...{
            ...scrollProps,
            ...scrollViewProps,
          }}
        />
      )}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(
              refreshControl,
              // @ts-ignore block exists (on our RefreshControl)
              scrollGesture ? { block: scrollGesture } : {}
            )
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
