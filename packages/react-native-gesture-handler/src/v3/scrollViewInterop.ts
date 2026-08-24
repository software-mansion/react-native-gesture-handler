import * as React from 'react';
import { TextInput } from 'react-native';

export type KeyboardShouldPersistTaps =
  | boolean
  | 'always'
  | 'never'
  | 'handled'
  | undefined;

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

let isKeyboardVisible = false;
let keyboardOpenedForRNInput = false;

export function setKeyboardVisibility(visible: boolean) {
  isKeyboardVisible = visible;

  // Snapshotted at show-time: the dismissal blurs the input at touch-down,
  // before the press events get checked
  keyboardOpenedForRNInput =
    visible && TextInput.State.currentlyFocusedInput?.() != null;
}

export function isKeyboardDismissingTap(
  jsResponderContext: JSResponderContextValue | null | undefined
): boolean {
  if (jsResponderContext == null) {
    return false;
  }

  const mode = jsResponderContext.keyboardShouldPersistTaps;
  const keyboardNeverPersistTaps = !mode || mode === 'never';

  // Drop only taps that can dismiss the keyboard, i.e. an RN TextInput is (or
  // was at show-time) focused - mirrors RN ScrollView's `_keyboardIsDismissible`.
  // A native field's keyboard (e.g. a native-stack search bar) can't be
  // blurred, so dropping there would leave presses permanently dead
  return (
    keyboardNeverPersistTaps &&
    isKeyboardVisible &&
    (keyboardOpenedForRNInput ||
      TextInput.State.currentlyFocusedInput?.() != null)
  );
}
