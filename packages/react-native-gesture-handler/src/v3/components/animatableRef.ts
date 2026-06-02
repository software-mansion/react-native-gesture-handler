import type React from 'react';

type AnimatableRef<T> = T & {
  getAnimatableRef?: () => T | null;
};

export function setAndForwardAnimatableRef<T extends object>(
  localRef: React.MutableRefObject<T | null>,
  forwardedRef: React.Ref<T> | undefined,
  ref: T | null
) {
  localRef.current = ref;

  const animatableRef = ref as AnimatableRef<T> | null;
  if (animatableRef && !animatableRef.getAnimatableRef) {
    animatableRef.getAnimatableRef = () => ref;
  }

  if (typeof forwardedRef === 'function') {
    forwardedRef(ref);
  } else if (forwardedRef) {
    (forwardedRef as React.MutableRefObject<T | null>).current = ref;
  }
}
