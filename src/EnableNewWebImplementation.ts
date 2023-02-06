import { Platform } from 'react-native';

let useNewWebImplementation = true;
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
