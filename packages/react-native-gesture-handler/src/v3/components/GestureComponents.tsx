import React, {
  PropsWithChildren,
  ReactElement,
  useRef,
  useImperativeHandle,
  useState,
  RefObject,
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
  RefreshControlProps as RNRefreshControlProps,
} from 'react-native';

import createNativeWrapper, {
  ComponentWrapperRef,
} from '../createNativeWrapper';

import { NativeWrapperProperties } from '../types/NativeWrapperType';
import { NativeWrapperProps } from '../hooks/utils';
import { DetectorType } from '../detectors';
import { NativeGesture } from '../hooks/gestures/native/useNativeGesture';

export type ImperativeRefreshControlRef = ComponentWrapperRef<
  RNRefreshControlProps,
  RNRefreshControl
> | null;

export const RefreshControl = createNativeWrapper(
  RNRefreshControl,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  DetectorType.Virtual
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type RefreshControl = typeof RefreshControl;

export type ImperativeScrollViewRef = ComponentWrapperRef<
  RNScrollViewProps,
  RNScrollView
> | null;

const GHScrollView = createNativeWrapper<PropsWithChildren<RNScrollViewProps>>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  DetectorType.Intercepting
);

export const ScrollView = (
  props: RNScrollViewProps &
    NativeWrapperProperties & {
      ref?: React.RefObject<ImperativeScrollViewRef>;
      // This prop exists because using `ref` in `renderScrollComponent` doesn't work (it is overwritten by RN internals).
      innerRef?: (node: ImperativeScrollViewRef) => void;
    }
) => {
  const { refreshControl, innerRef, ref, ...rest } = props;

  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(
    null
  );

  const wrapperRef = useRef<ImperativeScrollViewRef>(null);

  useImperativeHandle<ImperativeScrollViewRef, ImperativeScrollViewRef>(
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

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof ScrollView;

export type ImperativeSwitchRef = ComponentWrapperRef<
  RNSwitchProps,
  RNSwitch
> | null;

export const Switch = createNativeWrapper<RNSwitchProps>(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch;

export type ImperativeTextInputRef = ComponentWrapperRef<
  RNTextInputProps,
  RNTextInput
> | null;

export const TextInput = createNativeWrapper<RNTextInputProps>(RNTextInput);

export type ImperativeFlatListRef<T = any> =
  | (ComponentWrapperRef<RNScrollViewProps, RNScrollView> & {
      flatListRef: RNFlatList<T> | null;
    })
  | null;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof TextInput;

export const FlatList = ((props) => {
  const { refreshControl, ref, ...rest } = props;

  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(
    null
  );

  const wrapperRef = useRef<ImperativeScrollViewRef>(null);
  const flatListRef = useRef<RNFlatList<any>>(null);

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

  useImperativeHandle<ImperativeFlatListRef, ImperativeFlatListRef>(
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
    Omit<RNFlatListProps<ItemT>, 'renderScrollComponent' | 'ref'> &
      NativeWrapperProperties & {
        ref?: RefObject<ImperativeFlatListRef<ItemT>>;
      }
  >
) => ReactElement | null;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList = typeof FlatList;
