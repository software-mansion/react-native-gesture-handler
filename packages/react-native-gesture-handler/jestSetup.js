jest.mock('./src/RNGestureHandlerModule', () => require('./src/mocks/mocks'));
jest.mock('./src/components/GestureButtons', () => require('./src/mocks/mocks'));
jest.mock('./src/components/Pressable/Pressable', () => require('./src/mocks/Pressable'));


jest.mock('./lib/commonjs/RNGestureHandlerModule', () =>
  require('./lib/commonjs/mocks/mocks')
);
jest.mock('./lib/commonjs/components/GestureButtons', () =>
  require('./lib/commonjs/mocks/mocks')
);
jest.mock('./lib/commonjs/components/Pressable', () =>
  require('./lib/commonjs/mocks/Pressable')
);


jest.mock('./lib/module/RNGestureHandlerModule', () =>
  require('./lib/module/mocks/mocks')
);
jest.mock('./lib/module/components/GestureButtons', () =>
  require('./lib/module/mocks/mocks')
);
jest.mock('./lib/module/components/Pressable', () =>
  require('./lib/module/mocks/Pressable')
);


