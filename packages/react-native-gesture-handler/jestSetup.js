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
