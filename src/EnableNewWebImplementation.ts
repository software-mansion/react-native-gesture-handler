import { Platform } from 'react-native';

let useNewWebImplementation = true;
let getWasCalled = false;

/**
 * @deprecated legacy implementation is no longer supported. This function will be removed in Gesture Handler 3
 */
export function enableExperimentalWebImplementation(
  _shouldEnable = true
): void {
  // NO-OP since the new implementation is now the default
  console.warn(
    'Legacy web implementation is deprecated. This function will be removed in Gesture Handler 3'
  );
}

/**
 * @deprecated legacy implementation is no longer supported. This function will be removed in Gesture Handler 3
 */
export function enableLegacyWebImplementation(
  shouldUseLegacyImplementation = true
): void {
  console.warn(
    'Legacy web implementation is deprecated and will be removed in Gesture Handler 3'
  );

  if (
    Platform.OS !== 'web' ||
    useNewWebImplementation === !shouldUseLegacyImplementation
  ) {
    return;
  }

  if (getWasCalled) {
    console.error(
      'Some parts of this application have already started using the new gesture handler implementation. No changes will be applied. You can try enabling legacy implementation earlier.'
    );
    return;
  }

  useNewWebImplementation = !shouldUseLegacyImplementation;
}

export function isNewWebImplementationEnabled(): boolean {
  getWasCalled = true;
  return useNewWebImplementation;
}
