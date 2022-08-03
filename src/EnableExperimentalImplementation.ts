export let EXPERIMENTAL_IMPLEMENTATION = false;

export function enableExperimentalWebImplementation(shouldEnable = true): void {
  EXPERIMENTAL_IMPLEMENTATION = shouldEnable;
}
