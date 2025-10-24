import React from 'react';
// code below is modified version of the code found in:
// https://github.com/reduxjs/react-redux/blob/7e2fdd4ee2021e4282e12ba9fc722f09124e30cd/src/utils/useIsomorphicLayoutEffect.ts#L36
// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and

// useLayoutEffect in the browser.
const isDOM = !!(
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
);

// Under React Native, we know that we always want to use useLayoutEffect
const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

export const useIsomorphicLayoutEffect =
  isDOM || isReactNative ? React.useLayoutEffect : React.useEffect;
