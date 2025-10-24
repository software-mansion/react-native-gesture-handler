import type { PointerType } from '../../PointerType';
import type {
  ActiveCursor,
  MouseButton,
  TouchAction,
  UserSelect,
} from '../../handlers/gestureHandlerCommon';
import type { State } from '../../State';
import type { Config } from '../interfaces';
import type EventManager from '../tools/EventManager';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import type PointerTracker from '../tools/PointerTracker';
import { SingleGestureName } from '../../v3/types';

export default interface IGestureHandler {
  active: boolean;
  activationIndex: number;
  awaiting: boolean;
  handlerTag: number;
  readonly delegate: GestureHandlerDelegate<unknown, this>;
  readonly tracker: PointerTracker;
  readonly name: SingleGestureName;
  state: State;
  shouldCancelWhenOutside: boolean;
  shouldResetProgress: boolean;
  readonly enabled: boolean | null;
  readonly pointerType: PointerType;
  enableContextMenu: boolean;
  readonly activeCursor?: ActiveCursor;
  readonly touchAction?: TouchAction;
  readonly userSelect?: UserSelect;

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
  shouldAttachGestureToChildView: () => boolean;

  sendEvent: (newState: State, oldState: State) => void;

  setGestureConfig: (config: Config) => void;
  updateGestureConfig: (config: Config) => void;

  isButton?: () => boolean;
}
