type RuntimeProviders = {
  worklets?: {
    getUIRuntimeHolder?: () => object;
  };
  reanimated?: {
    useSharedValue: unknown;
  };
};

function loadReanimatedWrapper(
  providers: RuntimeProviders,
  installUIRuntimeBindings: jest.Mock<boolean, []>
) {
  jest.doMock('../ghQueueMicrotask', () => ({
    ghQueueMicrotask: (callback: () => void) => callback(),
  }));
  jest.doMock('../v3/NativeProxy', () => ({
    NativeProxy: { installUIRuntimeBindings },
  }));
  jest.doMock('react-native-worklets', () => {
    if (providers.worklets === undefined) {
      throw new Error('react-native-worklets is unavailable');
    }

    return providers.worklets;
  });
  jest.doMock('react-native-reanimated', () => {
    if (providers.reanimated === undefined) {
      throw new Error('react-native-reanimated is unavailable');
    }

    return providers.reanimated;
  });

  jest.isolateModules(() => {
    require('../handlers/gestures/reanimatedWrapper');
  });
}

beforeEach(() => {
  jest.resetModules();
  globalThis.__RNGH_UI_WORKLET_RUNTIME_HOLDER = undefined;
});

test('passes the Worklets runtime holder to native during installation', () => {
  const runtimeHolder = {};
  let holderDuringInstallation: object | undefined;
  const installUIRuntimeBindings = jest.fn(() => {
    holderDuringInstallation = globalThis.__RNGH_UI_WORKLET_RUNTIME_HOLDER;
    return true;
  });

  loadReanimatedWrapper(
    {
      worklets: { getUIRuntimeHolder: () => runtimeHolder },
      reanimated: { useSharedValue: true },
    },
    installUIRuntimeBindings
  );

  expect(installUIRuntimeBindings).toHaveBeenCalledTimes(1);
  expect(holderDuringInstallation).toBe(runtimeHolder);
  expect(globalThis.__RNGH_UI_WORKLET_RUNTIME_HOLDER).toBeUndefined();
});

test('installs legacy bindings when Reanimated is available without Worklets', () => {
  const installUIRuntimeBindings = jest.fn(() => true);

  loadReanimatedWrapper(
    { reanimated: { useSharedValue: true } },
    installUIRuntimeBindings
  );

  expect(installUIRuntimeBindings).toHaveBeenCalledTimes(1);
  expect(globalThis.__RNGH_UI_WORKLET_RUNTIME_HOLDER).toBeUndefined();
});

test('does not install bindings when no runtime provider is available', () => {
  const installUIRuntimeBindings = jest.fn(() => true);

  loadReanimatedWrapper({}, installUIRuntimeBindings);

  expect(installUIRuntimeBindings).not.toHaveBeenCalled();
});
