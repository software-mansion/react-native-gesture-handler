export let EXPERIMENTAL_WEB_IMPLEMENTATION = false;

export function enableExperimentalWebImplementation(shouldEnable = true): void {
  EXPERIMENTAL_WEB_IMPLEMENTATION = shouldEnable;
}
