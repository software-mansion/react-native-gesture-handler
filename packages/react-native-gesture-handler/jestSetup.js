jest.mock('./src/RNGestureHandlerModule', () => require('./src/mocks/module'));
jest.mock('./src/components/GestureButtons', () =>
  require('./src/mocks/GestureButtons')
);
jest.mock('./src/components/Pressable/Pressable', () =>
  require('./src/mocks/Pressable')
);
jest.mock('./src/components/GestureComponents', () =>
  require('./src/mocks/gestureComponents')
);
jest.mock('./src/components/touchables', () =>
  require('./src/mocks/Touchables')
);
jest.mock('./src/v3/detectors/HostGestureDetector', () =>
  require('./src/mocks/hostDetector')
);
jest.mock('./src/specs/RNGestureHandlerButtonNativeComponent', () =>
  require('./src/mocks/nativeComponentSpec')
);
jest.mock('./src/specs/RNGestureHandlerDetectorNativeComponent', () =>
  require('./src/mocks/nativeComponentSpec')
);
jest.mock('./src/specs/RNGestureHandlerRootViewNativeComponent', () =>
  require('./src/mocks/nativeComponentSpec')
);

jest.mock('./lib/module/RNGestureHandlerModule', () =>
  require('./lib/module/mocks/module')
);
jest.mock('./lib/module/components/GestureButtons', () =>
  require('./lib/module/mocks/GestureButtons')
);
jest.mock('./lib/module/components/touchables', () =>
  require('./lib/module/mocks/Touchables')
);
jest.mock('./lib/module/components/Pressable', () =>
  require('./lib/module/mocks/Pressable')
);
jest.mock('./lib/module/components/GestureComponents', () =>
  require('./lib/module/mocks/gestureComponents')
);
jest.mock('./lib/module/v3/detectors/HostGestureDetector', () =>
  require('./lib/module/mocks/hostDetector')
);
jest.mock('./lib/module/specs/RNGestureHandlerButtonNativeComponent', () =>
  require('./lib/module/mocks/nativeComponentSpec')
);
jest.mock('./lib/module/specs/RNGestureHandlerDetectorNativeComponent', () =>
  require('./lib/module/mocks/nativeComponentSpec')
);
jest.mock('./lib/module/specs/RNGestureHandlerRootViewNativeComponent', () =>
  require('./lib/module/mocks/nativeComponentSpec')
);

jest.mock('./lib/commonjs/RNGestureHandlerModule', () =>
  require('./lib/commonjs/mocks/module')
);
jest.mock('./lib/commonjs/components/GestureButtons', () =>
  require('./lib/commonjs/mocks/GestureButtons')
);
jest.mock('./lib/commonjs/components/touchables', () =>
  require('./lib/commonjs/mocks/Touchables')
);
jest.mock('./lib/commonjs/components/Pressable', () =>
  require('./lib/commonjs/mocks/Pressable')
);
jest.mock('./lib/commonjs/components/GestureComponents', () =>
  require('./lib/commonjs/mocks/gestureComponents')
);
jest.mock('./lib/commonjs/v3/detectors/HostGestureDetector', () =>
  require('./lib/commonjs/mocks/hostDetector')
);
jest.mock('./lib/commonjs/specs/RNGestureHandlerButtonNativeComponent', () =>
  require('./lib/commonjs/mocks/nativeComponentSpec')
);
jest.mock('./lib/commonjs/specs/RNGestureHandlerDetectorNativeComponent', () =>
  require('./lib/commonjs/mocks/nativeComponentSpec')
);
jest.mock('./lib/commonjs/specs/RNGestureHandlerRootViewNativeComponent', () =>
  require('./lib/commonjs/mocks/nativeComponentSpec')
);
