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
