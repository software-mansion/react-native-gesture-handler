const NOOP = () => {
  // Do nothing
};

const attachGestureHandler = NOOP;
const createGestureHandler = NOOP;
const dropGestureHandler = NOOP;
const setGestureHandlerConfig = NOOP;
const updateGestureHandlerConfig = NOOP;
const flushOperations = NOOP;
const configureRelations = NOOP;
const setReanimatedAvailable = NOOP;
const install = NOOP;

export default {
  attachGestureHandler,
  createGestureHandler,
  dropGestureHandler,
  setGestureHandlerConfig,
  updateGestureHandlerConfig,
  configureRelations,
  setReanimatedAvailable,
  flushOperations,
  install,
} as const;
