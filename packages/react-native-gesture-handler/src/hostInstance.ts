import type { Ref } from 'react';

export type WrapRef = Ref<unknown> | undefined;

export function assignRef(
  ref: WrapRef,
  instance: unknown
): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(instance as never);
    return typeof cleanup === 'function' ? cleanup : undefined;
  }

  if (ref) {
    ref.current = instance;
  }

  return undefined;
}

export function isHostInstance(instance: unknown) {
  return (
    (instance as { __internalInstanceHandle?: unknown } | null | undefined)
      ?.__internalInstanceHandle !== undefined
  );
}

export function preferHostInstance(instance: unknown) {
  if (instance === null || instance === undefined || isHostInstance(instance)) {
    return instance;
  }

  const nativeRef = (
    instance as { getNativeScrollRef?: () => unknown }
  ).getNativeScrollRef?.();

  return isHostInstance(nativeRef) ? nativeRef : instance;
}

export interface HostInstanceProvider {
  getHostInstance: () => unknown;
}

function providesHostInstance(ref: unknown): ref is HostInstanceProvider {
  return (
    typeof (ref as HostInstanceProvider | null | undefined)?.getHostInstance ===
    'function'
  );
}

export function resolveHostInstance<T>(ref: T): T {
  if (!providesHostInstance(ref)) {
    return ref;
  }

  return (ref.getHostInstance() ?? ref) as T;
}
