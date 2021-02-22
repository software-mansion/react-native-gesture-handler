import { View, ScrollView as RNScrollView } from 'react-native';
import { State } from './State';
import { Directions } from './Directions';

const NOOP = () => {
  // do nothing
};
const ScrollView = RNScrollView;
const PanGestureHandler = View;
const attachGestureHandler = NOOP;
const createGestureHandler = NOOP;
const dropGestureHandler = NOOP;
const updateGestureHandler = NOOP;

export default {
  ScrollView,
  PanGestureHandler,
  attachGestureHandler,
  createGestureHandler,
  dropGestureHandler,
  updateGestureHandler,
  // probably can be removed
  Directions,
  State,
} as const;
