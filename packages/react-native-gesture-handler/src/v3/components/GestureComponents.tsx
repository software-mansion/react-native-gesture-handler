import type { PropsWithChildren, ReactElement } from 'react';
import React, { useState } from 'react';
import type {
  FlatListProps as RNFlatListProps,
  RefreshControlProps as RNRefreshControlProps,
  ScrollViewProps as RNScrollViewProps,
  SwitchProps as RNSwitchProps,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import {
  FlatList as RNFlatList,
  RefreshControl as RNRefreshControl,
  ScrollView as RNScrollView,
  Switch as RNSwitch,
  TextInput as RNTextInput,
} from 'react-native';

import { ghQueueMicrotask } from '../../ghQueueMicrotask';
import createNativeWrapper from '../createNativeWrapper';
import { GestureDetectorType } from '../detectors';
import type { NativeGesture } from '../hooks/gestures/native/NativeTypes';
import { NativeWrapperProps } from '../hooks/utils';
import type { NativeWrapperProperties } from '../types/NativeWrapperType';
import ScrollViewResponderInterceptor, {
  interceptScrollViewChildren,
  ScrollViewResponderProvider,
} from './ScrollViewResponderInterceptor';

export const RefreshControl: React.ComponentType<
  RNRefreshControlProps &
    NativeWrapperProperties<React.ComponentRef<typeof RNRefreshControl> | null>
> = createNativeWrapper<
  React.ComponentRef<typeof RNRefreshControl>,
  RNRefreshControlProps
>(
  RNRefreshControl,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  GestureDetectorType.Virtual
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type RefreshControl = typeof RefreshControl & RNRefreshControl;

const GHScrollView = createNativeWrapper<
  React.ComponentRef<typeof RNScrollView>,
  PropsWithChildren<RNScrollViewProps>
>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  GestureDetectorType.Intercepting
);

export const ScrollView = (
  props: RNScrollViewProps &
    NativeWrapperProperties<React.ComponentRef<typeof RNScrollView> | null>
) => {
  const {
    children,
    refreshControl,
    onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER,
    keyboardShouldPersistTaps,
    ...rest
  } = props;

  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(
    null
  );

  const updateGesture = (gesture: NativeGesture) => {
    ghQueueMicrotask(() => {
      if (!scrollGesture || scrollGesture.handlerTag !== gesture.handlerTag) {
        setScrollGesture(gesture);
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?.(gesture);
      }
    });
  };

  // ScrollView resolves `stickyHeaderIndices` against its direct children, so
  // the single responder interceptor would collapse the
  // content into one child and pin all of it when index 0 is sticky.
  // ScrollViews using sticky headers move the responder context above the
  // ScrollView and leave the child count intact — with one logical responder
  // per child in 'handled' mode.
  const hasStickyHeaders =
    Array.isArray(rest.stickyHeaderIndices) &&
    rest.stickyHeaderIndices.length > 0;

  const scrollView = (
    <GHScrollView
      {...rest}
      ref={props.ref}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER={updateGesture}
      // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
      refreshControl={
        refreshControl
          ? React.cloneElement(
              refreshControl,
              // @ts-ignore block exists (on our RefreshControl)
              scrollGesture ? { block: scrollGesture } : {}
            )
          : undefined
      }>
      {!hasStickyHeaders ? (
        <ScrollViewResponderInterceptor
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
          {children}
        </ScrollViewResponderInterceptor>
      ) : keyboardShouldPersistTaps === 'handled' ? (
        interceptScrollViewChildren(children)
      ) : (
        children
      )}
    </GHScrollView>
  );

  // The provider is required even when no logical responders are rendered —
  // Pressable and Touchable read its context (and its keyboard-visibility
  // tracking) to suppress presses on keyboard-dismissing taps in 'never'
  // mode. Only the responder wrappers are gated on 'handled'.
  return hasStickyHeaders ? (
    <ScrollViewResponderProvider
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
      {scrollView}
    </ScrollViewResponderProvider>
  ) : (
    scrollView
  );
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof ScrollView & RNScrollView;

export const Switch: React.ComponentType<
  RNSwitchProps &
    NativeWrapperProperties<React.ComponentRef<typeof RNSwitch> | null>
> = createNativeWrapper<React.ComponentRef<typeof RNSwitch>, RNSwitchProps>(
  RNSwitch,
  {
    shouldCancelWhenOutside: false,
    shouldActivateOnStart: true,
    disallowInterruption: true,
  }
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch & RNSwitch;

export const TextInput: React.ComponentType<
  RNTextInputProps &
    NativeWrapperProperties<React.ComponentRef<typeof RNTextInput> | null>
> = createNativeWrapper<
  React.ComponentRef<typeof RNTextInput>,
  RNTextInputProps
>(RNTextInput);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextInput = typeof TextInput & RNTextInput;

export const FlatList = ((props) => {
  const {
    refreshControl,
    ref,
    onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER,
    ...rest
  } = props;

  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(
    null
  );

  const updateGesture = (gesture: NativeGesture) => {
    ghQueueMicrotask(() => {
      if (!scrollGesture || scrollGesture.handlerTag !== gesture.handlerTag) {
        setScrollGesture(gesture);
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?.(gesture);
      }
    });
  };

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

  return (
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    <RNFlatList
      ref={ref}
      {...flatListProps}
      renderScrollComponent={(scrollProps) => (
        <ScrollView
          onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER={updateGesture}
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
      NativeWrapperProperties<RNFlatList<ItemT> | null>
  >
) => ReactElement | null;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList<ItemT = any> = typeof FlatList & RNFlatList<ItemT>;
