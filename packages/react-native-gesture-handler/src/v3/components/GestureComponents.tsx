import React, {
  PropsWithChildren,
  ReactElement,
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
} from 'react-native';

import createNativeWrapper from '../createNativeWrapper';

import { NativeWrapperProperties } from '../types/NativeWrapperType';
import { NativeWrapperProps } from '../hooks/utils';
import { GestureDetectorType } from '../detectors';
import { NativeGesture } from '../hooks/gestures/native/useNativeGesture';
import { ghQueueMicrotask } from '../../ghQueueMicrotask';

export const RefreshControl = createNativeWrapper(
  RNRefreshControl,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  GestureDetectorType.Virtual
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type RefreshControl = typeof RefreshControl & RNRefreshControl;

const GHScrollView = createNativeWrapper<PropsWithChildren<RNScrollViewProps>>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  GestureDetectorType.Intercepting
);

export const ScrollView = (
  props: RNScrollViewProps &
    NativeWrapperProperties & {
      ref?: React.RefObject<RNScrollView | null>;
      onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
        gesture: NativeGesture
      ) => void;
    }
) => {
  const {
    refreshControl,
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

  return (
    <GHScrollView
      {...rest}
      ref={props.ref}
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
      }
    />
  );
};

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
      NativeWrapperProperties & {
        ref?: RefObject<RNFlatList<ItemT> | null>;
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
          gesture: NativeGesture
        ) => void;
      }
  >
) => ReactElement | null;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlatList = typeof FlatList & RNFlatList;
