import type { PointerType } from '../../PointerType';
import type { MouseButton } from '../../handlers/gestureHandlerCommon';
import type { State } from '../../State';
import type { Config } from '../interfaces';
import type EventManager from '../tools/EventManager';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import type PointerTracker from '../tools/PointerTracker';

export default interface IGestureHandler {
  active: boolean;
  activationIndex: number;
  awaiting: boolean;
  handlerTag: number;
  readonly config: Config;
  readonly delegate: GestureHandlerDelegate<unknown, this>;
  readonly tracker: PointerTracker;
  state: State;
  shouldCancelWhenOutside: boolean;
  shouldResetProgress: boolean;
  enabled: boolean;
  pointerType: PointerType;

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
  detach: () => void;

  shouldWaitForHandlerFailure: (handler: IGestureHandler) => boolean;
  shouldRequireToWaitForFailure: (handler: IGestureHandler) => boolean;
  shouldRecognizeSimultaneously: (handler: IGestureHandler) => boolean;
  shouldBeCancelledByOther: (handler: IGestureHandler) => boolean;

  sendEvent: (newState: State, oldState: State) => void;

  updateGestureConfig: (config: Config) => void;

  isButton?: () => boolean;
}
