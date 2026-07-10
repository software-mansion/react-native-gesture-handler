import type { RefObject } from 'react';

import type { ActionType } from '../../ActionType';
import type {
  ActiveCursor,
  MouseButton,
  TouchAction,
  UserSelect,
} from '../../handlers/gestureHandlerCommon';
import type { PointerType } from '../../PointerType';
import type { State } from '../../State';
import type { SingleGestureName } from '../../v3/types';
import type { Config, HostDetector, PropsRef } from '../interfaces';
import type EventManager from '../tools/EventManager';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import type GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import type InteractionManager from '../tools/InteractionManager';
import type PointerTracker from '../tools/PointerTracker';

export default interface IGestureHandler {
  attached: boolean;
  hostDetectorView: HostDetector | null;
  active: boolean;
  activationIndex: number;
  awaiting: boolean;
  handlerTag: number;
  readonly testID?: string | undefined;
  readonly delegate: GestureHandlerDelegate<unknown, this>;
  readonly tracker: PointerTracker;
  readonly name: SingleGestureName;
  readonly isContinuous: boolean;
  state: State;
  shouldCancelWhenOutside: boolean;
  shouldResetProgress: boolean;
  readonly enabled: boolean | null;
  readonly pointerType: PointerType;
  enableContextMenu: boolean;
  readonly activeCursor?: ActiveCursor | undefined;
  readonly touchAction?: TouchAction | undefined;
  readonly userSelect?: UserSelect | undefined;

  usesNativeOrVirtualDetector: () => boolean;

  attachEventManager: (manager: EventManager<unknown>) => void;
  setGestureHandlerOrchestrator: (
    orchestrator: GestureHandlerOrchestrator
  ) => void;
  setInteractionManager: (interactionManager: InteractionManager) => void;

  isButtonInConfig: (
    mouseButton: MouseButton | undefined
  ) => boolean | number | undefined;

  getTrackedPointersID: () => number[];

  begin: () => void;
  activate: (force: boolean) => void;
  end: () => void;
  fail: () => void;
  cancel: () => void;

  init: (
    viewRef: number,
    propsRef: RefObject<PropsRef>,
    actionType: ActionType,
    hostDetector?: HostDetector | null
  ) => void;
  reset: () => void;
  detach: () => void;

  shouldWaitForHandlerFailure: (handler: IGestureHandler) => boolean;
  shouldRequireToWaitForFailure: (handler: IGestureHandler) => boolean;
  shouldRecognizeSimultaneously: (handler: IGestureHandler) => boolean;
  shouldBeCancelledByOther: (handler: IGestureHandler) => boolean;
  shouldBeginWithRecordedHandlers: (recorded: IGestureHandler[]) => boolean;
  shouldAttachGestureToChildView: () => boolean;

  sendEvent: (newState: State, oldState: State) => void;

  setGestureConfig: (config: Config) => void;
  updateGestureConfig: (config: Partial<Config>) => void;

  isButton?: () => boolean;
}
