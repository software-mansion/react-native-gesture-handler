import { PointerType } from '../../PointerType';
import { MouseButton } from '../../handlers/gestureHandlerCommon';
import { State } from '../../State';
import { Config } from '../interfaces';
import EventManager from '../tools/EventManager';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import PointerTracker from '../tools/PointerTracker';

export default interface GestureHandlerInterface {
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
  activate: () => void;
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

  shouldWaitForHandlerFailure: (handler: GestureHandlerInterface) => boolean;
  shouldRequireToWaitForFailure: (handler: GestureHandlerInterface) => boolean;
  shouldRecognizeSimultaneously: (handler: GestureHandlerInterface) => boolean;
  shouldBeCancelledByOther: (handler: GestureHandlerInterface) => boolean;

  sendEvent: (newState: State, oldState: State) => void;
}
