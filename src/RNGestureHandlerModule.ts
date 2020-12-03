import { NativeModules } from 'react-native';

const { RNGestureHandlerModule } = NativeModules;

type Directions = {
  readonly RIGHT: 1;
  readonly LEFT: 2;
  readonly UP: 4;
  readonly DOWN: 8;
};

export type RNGestureHandlerModuleProps = {
  Direction: Directions;
  handleSetJSResponder: (tag: number, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: <T>(
    handlerName: string,
    handlerTag: number,
    config: T //TODO extends config
  ) => void;
  attachGestureHandler: (handlerTag: number, newView: number) => void;
  updateGestureHandler: <T>(handlerTag: number, newConfig: T) => void;
};

export default RNGestureHandlerModule as RNGestureHandlerModuleProps;
