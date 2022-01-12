import { JestGestureHandlerRegistry } from './src/jestUtils';
jest.mock('./src/RNGestureHandlerModule', () => require('./src/mocks'));
jest.mock('./lib/commonjs/RNGestureHandlerModule', () =>
  require('./lib/commonjs/mocks')
);
jest.mock('./lib/module/RNGestureHandlerModule', () =>
  require('./lib/module/mocks')
);
// I need global register shared between Jest and React enviroment
global.JestGestureHandlerRegistry = JestGestureHandlerRegistry;
