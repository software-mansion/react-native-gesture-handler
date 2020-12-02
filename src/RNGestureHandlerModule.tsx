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
  handleSetJSResponder: (tag: number, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: number,
    config
  ) => void;
  attachGestureHandler: (handlerTag: number, newView, propsRef) => void;
  updateGestureHandler: (handlerTag: number, newConfig) => void;
}

export default RNGestureHandlerModule as RNGestureHandlerModuleProps;
