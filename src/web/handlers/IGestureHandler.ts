import type { PointerType } from '../../PointerType';
import type { MouseButton } from '../../handlers/gestureHandlerCommon';
import type { State } from '../../State';
import type { Config } from '../interfaces';
import type EventManager from '../tools/EventManager';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import type PointerTracker from '../tools/PointerTracker';

export default interface IGestureHandler {
  getTag: () => number;
  getState: () => State;
  getConfig: () => Config;
  getDelegate: () => GestureHandlerDelegate<unknown, this>;

  attachEventManager: (manager: EventManager<unknown>) => void;

  isButtonInConfig: (
    mouseButton: MouseButton | undefined
  ) => boolean | number | undefined;
  getPointerType: () => PointerType;

  getTracker: () => PointerTracker;
  getTrackedPointersID: () => number[];

  begin: () => void;
  activate: (force: boolean) => void;
  end: () => void;
  fail: () => void;
  cancel: () => void;

  reset: () => void;
  isEnabled: () => boolean;
  isActive: () => boolean;
  setActive: (value: boolean) => void;
  isAwaiting: () => boolean;
  setAwaiting: (value: boolean) => void;
  setActivationIndex: (value: number) => void;
  setShouldResetProgress: (value: boolean) => void;

  shouldWaitForHandlerFailure: (handler: IGestureHandler) => boolean;
  shouldRequireToWaitForFailure: (handler: IGestureHandler) => boolean;
  shouldRecognizeSimultaneously: (handler: IGestureHandler) => boolean;
  shouldBeCancelledByOther: (handler: IGestureHandler) => boolean;

  sendEvent: (newState: State, oldState: State) => void;

  updateGestureConfig: (config: Config) => void;

  isButton?: () => boolean;
}
