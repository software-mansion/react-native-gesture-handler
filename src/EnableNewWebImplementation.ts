import { Platform } from 'react-native';

let USE_NEW_WEB_IMPLEMENTATION = true;
let getWasCalled = false;

export function enableExperimentalWebImplementation(
  _shouldEnable = true
): void {
  // NO-OP since the new implementation is now the default
}

export function enableLegacyWebImplementation(
  shouldUseLegacyImplementation = true
): void {
  if (
    Platform.OS !== 'web' ||
    USE_NEW_WEB_IMPLEMENTATION === !shouldUseLegacyImplementation
  ) {
    return;
  }

  if (getWasCalled) {
    console.error(
      'Some parts of this application have already started using old gesture handler implementation. No changes will be applied. You can try enabling new implementation earlier.'
    );
    return;
  }

  USE_NEW_WEB_IMPLEMENTATION = !shouldUseLegacyImplementation;
}

export function isNewWebImplementationEnabled(): boolean {
  getWasCalled = true;
  return USE_NEW_WEB_IMPLEMENTATION;
}
