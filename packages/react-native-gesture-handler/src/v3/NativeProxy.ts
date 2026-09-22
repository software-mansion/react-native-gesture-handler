import { scheduleOperationToBeFlushed } from '../handlers/utils';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import type {
  BaseGestureConfig,
  GestureRelations,
  SingleGestureName,
} from './types';

// Destructure functions that can be called on the UI thread to have
// a raw HostFunction reference
const { flushOperations, updateGestureHandlerConfig } = RNGestureHandlerModule;

export const NativeProxy = {
  createGestureHandler: <T extends Record<string, unknown>>(
    handlerName: SingleGestureName,
    handlerTag: number,
    config?: T
  ) => {
    scheduleOperationToBeFlushed(() => {
      RNGestureHandlerModule.createGestureHandler(
        handlerName,
        handlerTag,
        config || {}
      );
    });
  },
  setGestureHandlerConfig: <
    TConfig,
    THandlerData,
    TExtendedHandlerData extends THandlerData,
  >(
    handlerTag: number,
    newConfig: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  ) => {
    scheduleOperationToBeFlushed(() => {
      RNGestureHandlerModule.setGestureHandlerConfig(handlerTag, newConfig);
    });
  },
  // updateGestureHandlerConfig can be called on the UI thread when using
  // SharedValue binding, so it needs to be a worklet and calls the module
  // directly instead of going through the operation queue above. The native
  // side still applies it asynchronously.
  updateGestureHandlerConfig: <
    TConfig,
    THandlerData,
    TExtendedHandlerData extends THandlerData,
  >(
    handlerTag: number,
    newConfig: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  ) => {
    'worklet';
    updateGestureHandlerConfig(handlerTag, newConfig);
    flushOperations();
  },
  dropGestureHandler: (handlerTag: number) => {
    scheduleOperationToBeFlushed(() => {
      RNGestureHandlerModule.dropGestureHandler(handlerTag);
    });
  },
  configureRelations: (handlerTag: number, relations: GestureRelations) => {
    scheduleOperationToBeFlushed(() => {
      RNGestureHandlerModule.configureRelations(handlerTag, relations);
    });
  },
  installUIRuntimeBindings: () => {
    return RNGestureHandlerModule.installUIRuntimeBindings();
  },
} as const;
