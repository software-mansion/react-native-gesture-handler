import { GestureType, HandlerCallbacks } from '../gesture';
import { SharedValue } from '../reanimatedWrapper';
import { HandlerStateChangeEvent } from '../../gestureHandlerCommon';

export type GestureConfigReference = {
  gesturesToAttach: GestureType[];
  animatedEventHandler: unknown;
  animatedHandlers: SharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  > | null;
  firstExecution: boolean;
  shouldUseReanimated: boolean;
};

export interface WebEventHandler {
  onGestureHandlerEvent: (event: HandlerStateChangeEvent<unknown>) => void;
  onGestureHandlerStateChange?: (
    event: HandlerStateChangeEvent<unknown>
  ) => void;
}
