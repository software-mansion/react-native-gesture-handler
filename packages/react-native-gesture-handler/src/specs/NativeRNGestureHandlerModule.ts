import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  createGestureHandler: (
    handlerName: string,
    handlerTag: Double,
    // Record<> is not supported by codegen
    // eslint-disable-next-line @typescript-eslint/ban-types
    config: Object
  ) => void;
  attachGestureHandler: (
    handlerTag: Double,
    newView: Double,
    actionType: Double
  ) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setGestureHandlerConfig: (handlerTag: Double, newConfig: Object) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateGestureHandlerConfig: (handlerTag: Double, newConfig: Object) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  configureRelations: (handlerTag: Double, relations: Object) => void;
  dropGestureHandler: (handlerTag: Double) => void;
  flushOperations: () => void;
  setReanimatedAvailable: (isAvailable: boolean) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGestureHandlerModule');
