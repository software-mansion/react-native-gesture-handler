jest.mock('../src/v3/detectors/useEnsureGestureHandlerRootView', () => ({
  useEnsureGestureHandlerRootView: () => {},
}));

jest.mock('../lib/module/v3/detectors/useEnsureGestureHandlerRootView', () => ({
  useEnsureGestureHandlerRootView: () => {},
}));
