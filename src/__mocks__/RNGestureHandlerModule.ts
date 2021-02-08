import { View, ScrollView } from 'react-native';

const NOOP = () => {
  // do nothing
};

export default {
  ScrollView,
  PanGestureHandler: View,
  attachGestureHandler: NOOP,
  createGestureHandler: NOOP,
  dropGestureHandler: NOOP,
  updateGestureHandler: NOOP,
  Direction: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
  State: {
    BEGAN: 'BEGAN',
    FAILED: 'FAILED',
    ACTIVE: 'ACTIVE',
    END: 'END',
    UNDETERMINED: 'UNDETERMINED',
  },
};
