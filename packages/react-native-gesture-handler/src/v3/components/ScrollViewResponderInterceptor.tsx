import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  EmitterSubscription,
  GestureResponderEvent,
  KeyboardEvent,
  ScrollViewProps as RNScrollViewProps,
} from 'react-native';
import { Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';

type KeyboardShouldPersistTaps = RNScrollViewProps['keyboardShouldPersistTaps'];

// The listeners are shared by every mounted ScrollView, so attach/detach is
// reference-counted: we subscribe on the first interceptor and tear down only
// once the last one unmounts.
let keyboardTrackerRefCount = 0;
let keyboardTrackerSubscriptions: EmitterSubscription[] = [];
let isKeyboardVisible = false;

function keyboardIsOpen(height: number | undefined): boolean {
  return height != null && height > 0;
}

function subscribeToKeyboardVisibility() {
  keyboardTrackerRefCount++;

  if (keyboardTrackerRefCount > 1 || Keyboard?.addListener == null) {
    return;
  }

  const setVisible = (event: KeyboardEvent) => {
    isKeyboardVisible = keyboardIsOpen(event.endCoordinates?.height);
  };
  const setHidden = () => {
    isKeyboardVisible = false;
  };

  // Seed from the current keyboard metrics in case it is already open when the
  // first ScrollView mounts (mirrors ScrollView seeding from Keyboard.metrics()).
  isKeyboardVisible = keyboardIsOpen(Keyboard.metrics?.()?.height);

  keyboardTrackerSubscriptions = [
    Keyboard.addListener('keyboardDidShow', setVisible),
    Keyboard.addListener('keyboardWillShow', setVisible),
    Keyboard.addListener('keyboardDidHide', setHidden),
  ];
}

function unsubscribeFromKeyboardVisibility() {
  keyboardTrackerRefCount--;

  if (keyboardTrackerRefCount > 0) {
    return;
  }

  for (const subscription of keyboardTrackerSubscriptions) {
    subscription.remove();
  }
  keyboardTrackerSubscriptions = [];
  isKeyboardVisible = false;
}

export type JSResponderContextValue = {
  isRNGHResponderEvent: React.MutableRefObject<boolean>;
  keyboardShouldPersistTaps: KeyboardShouldPersistTaps;
};

export const JSResponderContext =
  React.createContext<JSResponderContextValue | null>(null);

export function updateResponderEventValue(
  jsResponderContext: JSResponderContextValue | null | undefined,
  value: boolean
) {
  const responderEventRef = jsResponderContext?.isRNGHResponderEvent;

  if (responderEventRef) {
    responderEventRef.current = value;
  }
}

export function isKeyboardDismissingTap(
  jsResponderContext: JSResponderContextValue | null | undefined
): boolean {
  if (jsResponderContext == null) {
    return false;
  }

  const mode = jsResponderContext.keyboardShouldPersistTaps;
  const keyboardNeverPersistTaps = !mode || mode === 'never';

  return keyboardNeverPersistTaps && isKeyboardVisible;
}

type ScrollViewResponderInterceptorProps = PropsWithChildren<{
  keyboardShouldPersistTaps?: RNScrollViewProps['keyboardShouldPersistTaps'];
}>;

// Mirrors ScrollView's `_keyboardIsDismissible` + `_softKeyboardIsDetached`
// (react-native/Libraries/Components/ScrollView/ScrollView.js) using only
// public API.
function keyboardIsDismissible(): boolean {
  const currentlyFocusedInput = TextInput.State.currentlyFocusedInput();
  if (currentlyFocusedInput == null) {
    return false;
  }

  const metrics = Keyboard.metrics?.();

  const softKeyboardMayBeOpen =
    metrics != null ||
    (Platform.OS === 'android' && Number(Platform.Version) < 30);

  const softKeyboardIsDetached = metrics != null && metrics.height === 0;

  return softKeyboardMayBeOpen && !softKeyboardIsDetached;
}

// In 'handled' mode, consumes RNGH-marked responder events so handled taps
// don't dismiss the keyboard (see the PR #4158 discussion), and reimplements
// RN ScrollView's own 'handled' dismissal, which GH ScrollView turns off via
// `disableScrollViewPanResponder`. The wrapper sits ABOVE the ScrollView so
// its children stay untouched for `stickyHeaderIndices` (#4328).
// https://github.com/software-mansion/react-native-gesture-handler/pull/4158#issuecomment-4431632964
export const ScrollViewResponderProvider = ({
  children,
  keyboardShouldPersistTaps,
}: ScrollViewResponderInterceptorProps) => {
  const isRNGHResponderEvent = useRef(false);
  const claimedForKeyboardDismissal = useRef(false);
  const contextValue = useMemo(
    () => ({ isRNGHResponderEvent, keyboardShouldPersistTaps }),
    [isRNGHResponderEvent, keyboardShouldPersistTaps]
  );

  useEffect(() => {
    subscribeToKeyboardVisibility();
    return () => unsubscribeFromKeyboardVisibility();
  }, []);

  const resetRNGHResponderEvent = useCallback(() => {
    isRNGHResponderEvent.current = false;
    return false;
  }, []);

  const handleStartShouldSetResponder = useCallback(
    (event: GestureResponderEvent) => {
      if (isRNGHResponderEvent.current) {
        // Claim marked events so outer keyboard-dismissing responders can't —
        // release does nothing and the keyboard stays open.
        isRNGHResponderEvent.current = false;
        claimedForKeyboardDismissal.current = false;
        return true;
      }

      // Unhandled tap — claim to dismiss the keyboard on release, like RN
      // ScrollView's 'handled' claim would.
      const shouldClaim =
        keyboardIsDismissible() &&
        event.target !== TextInput.State.currentlyFocusedInput();
      claimedForKeyboardDismissal.current = shouldClaim;
      return shouldClaim;
    },
    []
  );

  const handleResponderRelease = useCallback((event: GestureResponderEvent) => {
    if (!claimedForKeyboardDismissal.current) {
      return;
    }
    claimedForKeyboardDismissal.current = false;

    const currentlyFocusedInput = TextInput.State.currentlyFocusedInput();
    if (
      currentlyFocusedInput != null &&
      keyboardIsDismissible() &&
      event.target !== currentlyFocusedInput
    ) {
      TextInput.State.blurTextInput(currentlyFocusedInput);
    }
  }, []);

  // A native scroll taking over terminates the JS responder — mirror RN's
  // `_observedScrollSinceBecomingResponder` guard by skipping the dismissal.
  const handleResponderTerminate = useCallback(() => {
    claimedForKeyboardDismissal.current = false;
  }, []);

  const isHandledMode = keyboardShouldPersistTaps === 'handled';

  return (
    <JSResponderContext value={contextValue}>
      <View
        collapsable={false}
        pointerEvents="box-none"
        style={styles.logicalResponder}
        onStartShouldSetResponderCapture={
          isHandledMode ? resetRNGHResponderEvent : undefined
        }
        onStartShouldSetResponder={
          isHandledMode ? handleStartShouldSetResponder : undefined
        }
        onResponderRelease={isHandledMode ? handleResponderRelease : undefined}
        onResponderTerminate={
          isHandledMode ? handleResponderTerminate : undefined
        }>
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
