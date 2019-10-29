export default {
  attachGestureHandler: () => {},
  createGestureHandler: () => {},
  dropGestureHandler: () => {},
  updateGestureHandler: () => {},
  Direction: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
  State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END', UNDETERMINED: 'UNDETERMINED' },
};
