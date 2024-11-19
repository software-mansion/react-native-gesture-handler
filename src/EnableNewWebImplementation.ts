export function enableExperimentalWebImplementation(
  _shouldEnable = true
): void {
  // NO-OP since the new implementation is now the default
}

export function enableLegacyWebImplementation(
  _shouldUseLegacyImplementation = true
): void {
  console.error(
    'Legacy web implementation is no longer available in RNGH version >= 3.0.0'
  );
}

export function isNewWebImplementationEnabled(): boolean {
  return true;
}
