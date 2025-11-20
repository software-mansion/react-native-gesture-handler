import {
  Reanimated,
  ReanimatedHandler,
} from '../../../../handlers/gestures/reanimatedWrapper';
import { GestureCallbacks } from '../../../types';
import { getStateChangeHandler } from '../stateChangeHandler';

export function useReanimatedStateChangeEvent<THandlerData>(
  handlerTag: number,
  handlers: GestureCallbacks<THandlerData>,
  reanimatedHandler: ReanimatedHandler<THandlerData> | undefined
) {
  const callback = getStateChangeHandler(
    handlerTag,
    handlers,
    reanimatedHandler?.context
  );

  return Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedStateChange'],
    !!reanimatedHandler?.doDependenciesDiffer
  );
}
