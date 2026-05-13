import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  StyleSheet,
  Switch as RNSwitch,
  TextInput as RNTextInput,
  View,
} from 'react-native';

import { ghQueueMicrotask } from '../../ghQueueMicrotask';
import createNativeWrapper from '../createNativeWrapper';
import { GestureDetectorType } from '../detectors';
import type { NativeGesture } from '../hooks/gestures/native/NativeTypes';
import { NativeWrapperProps } from '../hooks/utils';
import { JSResponderContext } from '../JSResponderContext';
import type { NativeWrapperProperties } from '../types/NativeWrapperType';

export const RefreshControl = createNativeWrapper<
  RNRefreshControl,
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
  RNScrollView,
  PropsWithChildren<RNScrollViewProps>
>(
  RNScrollView,
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
  GestureDetectorType.Intercepting
);

type GHScrollViewResponderInterceptorProps = PropsWithChildren<{
  keyboardShouldPersistTaps?: RNScrollViewProps['keyboardShouldPersistTaps'];
}>;

const GHScrollViewResponderInterceptor = ({
  children,
  keyboardShouldPersistTaps,
}: GHScrollViewResponderInterceptorProps) => {
  const isRNGHResponderEvent = useRef(false);
  const contextValue = useMemo(
    () => ({ isRNGHResponderEvent }),
    [isRNGHResponderEvent]
  );

  const resetRNGHResponderEvent = useCallback(() => {
    isRNGHResponderEvent.current = false;
    return false;
  }, []);

  const handleStartShouldSetResponder = useCallback(() => {
    const shouldHandleRNGHEvent =
      keyboardShouldPersistTaps === 'handled' && isRNGHResponderEvent.current;

    isRNGHResponderEvent.current = false;

    return shouldHandleRNGHEvent;
  }, [keyboardShouldPersistTaps]);

  // RNGH tap responders need to let RN components higher in the tree handle
  // the JS responder event first. If no RN component claims it, this logical
  // ScrollView child consumes the marked event before ScrollView's own
  // keyboardShouldPersistTaps='handled' responder logic handles it.
  // For more information check this comment:
  // https://github.com/software-mansion/react-native-gesture-handler/pull/4158#issuecomment-4431632964
  return (
    <JSResponderContext value={contextValue}>
      <View
        collapsable={false}
        onStartShouldSetResponderCapture={resetRNGHResponderEvent}
        onStartShouldSetResponder={handleStartShouldSetResponder}
        pointerEvents="box-none"
        style={styles.logicalResponder}>
        {children}
      </View>
    </JSResponderContext>
  );
};

export const ScrollView = (
  props: RNScrollViewProps & NativeWrapperProperties<RNScrollView | null>
) => {
  const {
    children,
    refreshControl,
    onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER,
    horizontal,
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

  return (
    <GHScrollView
      {...rest}
      ref={props.ref}
      horizontal={horizontal}
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
      <GHScrollViewResponderInterceptor
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
        {children}
      </GHScrollViewResponderInterceptor>
    </GHScrollView>
  );
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ScrollView = typeof ScrollView & RNScrollView;

const styles = StyleSheet.create({
  logicalResponder: {
    display: 'contents',
  },
});

export const Switch = createNativeWrapper<RNSwitch, RNSwitchProps>(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Switch = typeof Switch & RNSwitch;

export const TextInput = createNativeWrapper<RNTextInput, RNTextInputProps>(
  RNTextInput
);

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
