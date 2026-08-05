import type * as PropsWhiteListModule from '../v3/hooks/utils/propsWhiteList';

function setDEV(value: boolean) {
  (globalThis as Record<string, unknown>).__DEV__ = value;
}

function loadFreshModule(): typeof PropsWhiteListModule {
  let module!: typeof PropsWhiteListModule;
  jest.isolateModules(() => {
    module = require('../v3/hooks/utils/propsWhiteList');
  });
  return module;
}

describe('applyProductionTestIDFilter', () => {
  afterEach(() => {
    setDEV(true);
    jest.resetModules();
  });

  test('keeps testID deliverable to the native side in dev', () => {
    const { allowedNativeProps, applyProductionTestIDFilter, PropsToFilter } =
      loadFreshModule();

    applyProductionTestIDFilter();

    expect(allowedNativeProps.has('testID')).toBe(true);
    expect(PropsToFilter.has('testID')).toBe(false);
  });

  test('strips testID from native props in production', () => {
    setDEV(false);
    const { allowedNativeProps, applyProductionTestIDFilter, PropsToFilter } =
      loadFreshModule();

    applyProductionTestIDFilter();

    expect(allowedNativeProps.has('testID')).toBe(false);
    expect(PropsToFilter.has('testID')).toBe(true);
  });

  test('applies the filter once and stays stable across repeated calls', () => {
    setDEV(false);
    const { allowedNativeProps, applyProductionTestIDFilter, PropsToFilter } =
      loadFreshModule();

    applyProductionTestIDFilter();
    applyProductionTestIDFilter();

    expect(allowedNativeProps.has('testID')).toBe(false);
    expect(PropsToFilter.has('testID')).toBe(true);
  });
});
