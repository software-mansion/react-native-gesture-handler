import RNGestureHandlerModule from '../RNGestureHandlerModule';
import {
  BaseGestureConfig,
  GestureRelations,
  SingleGestureName,
} from './types';

export const NativeProxy = {
  createGestureHandler: <T extends Record<string, unknown>>(
    handlerName: SingleGestureName,
    handlerTag: number,
    config?: T
  ) => {
    RNGestureHandlerModule.createGestureHandler(
      handlerName,
      handlerTag,
      config || {}
    );
  },
  setGestureHandlerConfig: <THandlerData, TConfig>(
    handlerTag: number,
    newConfig: BaseGestureConfig<THandlerData, TConfig>
  ) => {
    RNGestureHandlerModule.setGestureHandlerConfig(handlerTag, newConfig);
  },
  updateGestureHandlerConfig: <THandlerData, TConfig>(
    handlerTag: number,
    newConfig: BaseGestureConfig<THandlerData, TConfig>
  ) => {
    RNGestureHandlerModule.updateGestureHandlerConfig(handlerTag, newConfig);
  },
  dropGestureHandler: (handlerTag: number) => {
    RNGestureHandlerModule.dropGestureHandler(handlerTag);
  },
  configureRelations: (handlerTag: number, relations: GestureRelations) => {
    RNGestureHandlerModule.configureRelations(handlerTag, relations);
  },
  setReanimatedAvailable: (isAvailable: boolean) => {
    RNGestureHandlerModule.setReanimatedAvailable(isAvailable);
  },
} as const;
