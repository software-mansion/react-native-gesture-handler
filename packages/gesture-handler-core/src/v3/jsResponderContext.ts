import React from 'react';

// Structural replacement for React Native's
// ScrollViewProps['keyboardShouldPersistTaps'].
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

// Keyboard visibility is platform state: the native binding feeds it from RN
// Keyboard listeners (ScrollViewResponderInterceptor); bindings without a
// software keyboard concept simply never call the setter.
let isKeyboardVisible = false;

export function setKeyboardVisibility(visible: boolean) {
  isKeyboardVisible = visible;
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
