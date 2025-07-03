import { TurboModuleRegistry, TurboModule } from 'react-native';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  handleSetJSResponder: (tag: Double, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: Double,
    // Record<> is not supported by codegen
    // eslint-disable-next-line @typescript-eslint/ban-types
    config: Object
  ) => boolean;
  attachGestureHandler: (
    handlerTag: Double,
    newView: Double,
    actionType: Double
  ) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateGestureHandler: (handlerTag: Double, newConfig: Object) => void;
  dropGestureHandler: (handlerTag: Double) => void;
  flushOperations: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGestureHandlerModule');
