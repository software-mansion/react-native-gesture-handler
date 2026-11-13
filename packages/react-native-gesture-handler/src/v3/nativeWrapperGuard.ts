import type { ReactNode } from 'react';
import React from 'react';

import { tagMessage } from '../utils';
import { isComposedGesture } from './hooks/utils/relationUtils';
import type { Gesture } from './types';
import { SingleGestureName } from './types';

// Exported components that already come with a Native gesture attached
const nativeWrappers = new Map<unknown, string>();
// Places in the app that the warning was already logged for
const reportedPlaces = new Set<string>();

export function registerNativeWrappers(components: Record<string, unknown>) {
  if (__DEV__) {
    for (const [name, Component] of Object.entries(components)) {
      nativeWrappers.set(Component, name);
    }
  }
}

// Turns an owner stack into the `in Component` lines React uses in its warnings
function describeOwners(ownerStack: string) {
  const owners = [
    ...ownerStack.matchAll(/^\s*at ([A-Z][\w$]*)(?:\.render)? \(/gm),
  ];

  return owners
    .slice(0, 5)
    .map(([, name]) => `\n    in ${name}`)
    .join('');
}

function containsNativeGesture(gesture: Gesture): boolean {
  return isComposedGesture(gesture)
    ? gesture.gestures.some(containsNativeGesture)
    : gesture.type === SingleGestureName.Native;
}

export function warnIfNativeGestureWrapsNativeWrapper<TConfig, THandlerData>(
  gesture: Gesture<TConfig, THandlerData> | undefined,
  children: ReactNode
) {
  if (!__DEV__ || !gesture || !containsNativeGesture(gesture as Gesture)) {
    return;
  }

  const child = (
    Array.isArray(children) && children.length === 1 ? children[0] : children
  ) as { type?: unknown } | null | undefined;

  const childName = nativeWrappers.get(child?.type);

  if (!childName) {
    return;
  }

  // Identifies the place rendering the detector, so each one is reported once
  // eslint-disable-next-line @eslint-react/no-misused-capture-owner-stack -- guarded by __DEV__
  const ownerStack = React.captureOwnerStack?.() ?? '';
  const place = childName + ownerStack;

  if (reportedPlaces.has(place)) {
    return;
  }

  reportedPlaces.add(place);

  console.warn(
    tagMessage(
      `${childName} already has a Native gesture attached by Gesture Handler. Wrapping it with a GestureDetector that uses a Native gesture may result in unexpected behavior. Configure the gesture through the props of ${childName}, or use a component that is not wrapped (e.g. the one exported from \`react-native\`).${describeOwners(ownerStack)}`
    )
  );
}
