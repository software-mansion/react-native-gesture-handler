jest.mock('./src/RNGestureHandlerModule', () => require('./src/mocks'));
jest.mock('./src/components/GestureButtons', () => require('./src/mocks'));
jest.mock('./src/components/Pressable/Pressable', () => require('./src/mocks'));


jest.mock('./lib/commonjs/RNGestureHandlerModule', () =>
  require('./lib/commonjs/mocks')
);
jest.mock('./lib/commonjs/components/GestureButtons', () =>
  require('./lib/commonjs/mocks')
);
jest.mock('./lib/commonjs/components/Pressable/Pressable', () =>
  require('./lib/commonjs/mocks')
);


jest.mock('./lib/module/RNGestureHandlerModule', () =>
  require('./lib/module/mocks')
);
jest.mock('./lib/module/components/GestureButtons', () =>
  require('./lib/module/mocks')
);
jest.mock('./lib/module/components/Pressable/Pressable', () =>
  require('./lib/module/mocks')
);


