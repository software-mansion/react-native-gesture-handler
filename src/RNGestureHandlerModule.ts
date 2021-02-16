import { NativeModules } from 'react-native';

const { RNGestureHandlerModule } = NativeModules;

export type RNGestureHandlerModuleProps = {
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
