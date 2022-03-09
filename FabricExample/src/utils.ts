export function isHermes(): boolean {
  // @ts-expect-error HermesInternal is not yet included in the RN types
  return !!global?.HermesInternal;
}

export function isFabric(): boolean {
  return !!global?.nativeFabricUIManager;
}
