import { scheduleOperationToBeFlushed } from '../handlers/utils';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import {
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
  setGestureHandlerConfig: <THandlerData, TConfig>(
    handlerTag: number,
    newConfig: BaseGestureConfig<THandlerData, TConfig>
  ) => {
    scheduleOperationToBeFlushed(() => {
      RNGestureHandlerModule.setGestureHandlerConfig(handlerTag, newConfig);
    });
  },
  // updateGestureHandlerConfig can be called on the UI thread when using
  // SharedValue binding. Therefore, it needs to be a worklet and we flush
  // immediately since we're likely already on the UI thread.
  updateGestureHandlerConfig: <THandlerData, TConfig>(
    handlerTag: number,
    newConfig: BaseGestureConfig<THandlerData, TConfig>
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
} as const;
