const NOOP = () => {
  // Do nothing
};

const NOOPTrue = () => true;

const attachGestureHandler = NOOP;
const createGestureHandler = NOOP;
const dropGestureHandler = NOOP;
const setGestureHandlerConfig = NOOP;
const updateGestureHandlerConfig = NOOP;
const flushOperations = NOOP;
const configureRelations = NOOP;
const installUIRuntimeBindings = NOOPTrue;
const install = NOOP;

export default {
  attachGestureHandler,
  createGestureHandler,
  dropGestureHandler,
  setGestureHandlerConfig,
  updateGestureHandlerConfig,
  configureRelations,
  installUIRuntimeBindings,
  flushOperations,
  install,
} as const;
