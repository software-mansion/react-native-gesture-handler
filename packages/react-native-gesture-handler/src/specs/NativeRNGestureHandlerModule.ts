import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  handleSetJSResponder: (
    tag: CodegenTypes.Double,
    blockNativeResponder: boolean
  ) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: CodegenTypes.Double,
    // Record<> is not supported by codegen
    // eslint-disable-next-line @typescript-eslint/ban-types
    config: Object
  ) => void;
  attachGestureHandler: (
    handlerTag: CodegenTypes.Double,
    newView: CodegenTypes.Double,
    actionType: CodegenTypes.Double
  ) => void;
  updateGestureHandler: (
    handlerTag: CodegenTypes.Double,
    // eslint-disable-next-line @typescript-eslint/ban-types
    newConfig: Object
  ) => void;
  dropGestureHandler: (handlerTag: CodegenTypes.Double) => void;
  install: () => boolean;
  flushOperations: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGestureHandlerModule');
