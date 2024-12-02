import { PointerType } from '../../PointerType';
import type { MouseButton } from '../../handlers/gestureHandlerCommon';
import type { State } from '../../State';
import type { Config } from '../interfaces';
import type EventManager from '../tools/EventManager';
import { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import PointerTracker from '../tools/PointerTracker';

export default interface IGestureHandler {
  active: boolean;
  awaiting: boolean;
  activationIndex: number;

  config: Config;

  delegate: GestureHandlerDelegate<unknown, unknown>;

  enabled: boolean;

  pointerTracker: PointerTracker;
  pointerType: PointerType;

  state: State;
  handlerTag: number;

  attachEventManager: (manager: EventManager<unknown>) => void;

  isButtonInConfig: (
    mouseButton: MouseButton | undefined
  ) => boolean | number | undefined;

  getTrackedPointersID: () => number[];

  begin: () => void;
  activate: (force: boolean) => void;
  end: () => void;
  fail: () => void;
  cancel: () => void;

  reset: () => void;

  setShouldResetProgress: (value: boolean) => void;

  shouldWaitForHandlerFailure: (handler: IGestureHandler) => boolean;
  shouldRequireToWaitForFailure: (handler: IGestureHandler) => boolean;
  shouldRecognizeSimultaneously: (handler: IGestureHandler) => boolean;
  shouldBeCancelledByOther: (handler: IGestureHandler) => boolean;

  sendEvent: (newState: State, oldState: State) => void;

  updateGestureConfig: (config: Config) => void;

  isButton?: () => boolean;
}
