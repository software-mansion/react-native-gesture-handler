import type { PropsWithChildren } from 'react';
import React, { useCallback, useMemo, useRef } from 'react';
import type { ScrollViewProps as RNScrollViewProps } from 'react-native';
import { StyleSheet, View } from 'react-native';

export type JSResponderContextValue = {
  isRNGHResponderEvent: React.MutableRefObject<boolean>;
};

export const JSResponderContext =
  React.createContext<JSResponderContextValue | null>(null);

type ScrollViewResponderInterceptorProps = PropsWithChildren<{
  keyboardShouldPersistTaps?: RNScrollViewProps['keyboardShouldPersistTaps'];
}>;

const ScrollViewResponderInterceptor = ({
  children,
  keyboardShouldPersistTaps,
}: ScrollViewResponderInterceptorProps) => {
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

const styles = StyleSheet.create({
  logicalResponder: {
    display: 'contents',
  },
});

export default ScrollViewResponderInterceptor;
