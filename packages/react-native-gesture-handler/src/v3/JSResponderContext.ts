import React from 'react';

export type JSResponderContextValue = {
  isRNGHResponderEvent: React.MutableRefObject<boolean>;
};

export const JSResponderContext =
  React.createContext<JSResponderContextValue | null>(null);
