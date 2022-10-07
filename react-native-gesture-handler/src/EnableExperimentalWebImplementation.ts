import { Platform } from 'react-native';

let EXPERIMENTAL_WEB_IMPLEMENTATION = false;
let getWasCalled = false;

export function enableExperimentalWebImplementation(shouldEnable = true): void {
  if (
    Platform.OS !== 'web' ||
    EXPERIMENTAL_WEB_IMPLEMENTATION === shouldEnable
  ) {
    return;
  }

  if (getWasCalled) {
    console.error(
      'Some parts of this application have already started using old gesture handler implementation. No changes will be applied. You can try enabling new implementation earlier.'
    );
    return;
  }

  EXPERIMENTAL_WEB_IMPLEMENTATION = shouldEnable;
}

export function isExperimentalWebImplementationEnabled(): boolean {
  getWasCalled = true;
  return EXPERIMENTAL_WEB_IMPLEMENTATION;
}
