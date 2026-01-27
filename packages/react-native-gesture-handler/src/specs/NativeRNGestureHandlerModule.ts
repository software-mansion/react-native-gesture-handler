import { TurboModuleRegistry, TurboModule } from 'react-native';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  // This method returns a boolean only to force the codegen to generate
  // a synchronous method. The returned value doesn't have any meaning.
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
  setGestureHandlerConfig: (handlerTag: Double, newConfig: Object) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateGestureHandlerConfig: (handlerTag: Double, newConfig: Object) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  configureRelations: (handlerTag: Double, relations: Object) => void;
  dropGestureHandler: (handlerTag: Double) => void;
  flushOperations: () => void;
  setReanimatedAvailability: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGestureHandlerModule');
