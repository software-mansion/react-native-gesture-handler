import * as React from 'react';

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
