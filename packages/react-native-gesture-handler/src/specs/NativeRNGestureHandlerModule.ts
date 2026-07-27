import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
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

  setGestureHandlerConfig: (
    handlerTag: CodegenTypes.Double,
    // eslint-disable-next-line @typescript-eslint/ban-types
    newConfig: Object
  ) => void;

  updateGestureHandlerConfig: (
    handlerTag: CodegenTypes.Double,
    // eslint-disable-next-line @typescript-eslint/ban-types
    newConfig: Object
  ) => void;

  configureRelations: (
    handlerTag: CodegenTypes.Double,
    // eslint-disable-next-line @typescript-eslint/ban-types
    relations: Object
  ) => void;
  dropGestureHandler: (handlerTag: CodegenTypes.Double) => void;
  flushOperations: () => void;
  installUIRuntimeBindings: () => boolean;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGestureHandlerModule');
