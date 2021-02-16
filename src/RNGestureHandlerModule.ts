import { NativeModules } from 'react-native';

const { RNGestureHandlerModule } = NativeModules;

if (RNGestureHandlerModule === undefined) {
  console.error(
    `react-native-gesture-handler module was not found. Make sure you're running your app on the native platform.
    
    You can submit a bug report here: https://github.com/software-mansion/react-native-gesture-handler/issues`
  );
}

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
