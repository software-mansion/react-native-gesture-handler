import { NativeModules } from 'react-native';

const { RNGestureHandlerModule } = NativeModules;

enum Directions {
  RIGHT = 1,
  LEFT = 2,
  UP = 4,
  DOWN = 8,
}

type RNGestureHandlerModuleProps = {
  Direction: Directions;
}

export default RNGestureHandlerModule as RNGestureHandlerModuleProps;
