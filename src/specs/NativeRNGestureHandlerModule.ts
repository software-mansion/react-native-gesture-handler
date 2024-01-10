import { TurboModuleRegistry, TurboModule } from 'react-native';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  handleSetJSResponder: (tag: Int32, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: Int32,
    // Record<> is not supported by codegen
    // eslint-disable-next-line @typescript-eslint/ban-types
    config: Object
  ) => void;
  attachGestureHandler: (
    handlerTag: Int32,
    newView: Int32,
    actionType: Int32
  ) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateGestureHandler: (handlerTag: Int32, newConfig: Object) => void;
  dropGestureHandler: (handlerTag: Int32) => void;
  install: () => boolean;
  flushOperations: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGestureHandlerModule');
