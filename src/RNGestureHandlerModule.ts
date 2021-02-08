import { NativeModules } from 'react-native';

const { RNGestureHandlerModule } = NativeModules;

type Directions = Readonly<{
  RIGHT: 1;
  LEFT: 2;
  UP: 4;
  DOWN: 8;
}>;

export type RNGestureHandlerModuleProps = {
  Direction: Directions;
  handleSetJSResponder: (tag: number, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: number,
    config: Readonly<Record<string, unknown>>
  ) => void;
  attachGestureHandler: (handlerTag: number, newView: number) => void;
  updateGestureHandler: (
    handlerTag: number,
    newConfig: Readonly<Record<string, unknown>>
  ) => void;
  dropGestureHandler: (handlerTag: number) => void;
};

export default RNGestureHandlerModule as RNGestureHandlerModuleProps;
