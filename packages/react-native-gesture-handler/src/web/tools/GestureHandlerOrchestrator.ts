import type { GestureRelationPolicy } from '../../handlers/gestureArbitration/GestureArbitrationTypes';
import GestureArbitrator from '../../handlers/gestureArbitration/GestureArbitrator';
import { PointerType } from '../../PointerType';
import type { State } from '../../State';
import type IGestureHandler from '../handlers/IGestureHandler';
import PointerTracker from './PointerTracker';

function checkOverlap(
  handler: IGestureHandler,
  otherHandler: IGestureHandler
): boolean {
  // If handlers don't have common pointers, default return value is false.
  // However, if at least on pointer overlaps with both handlers, we return true
  // This solves issue in overlapping parents example

  // TODO: Find better way to handle that issue, for example by activation order and handler cancelling

  const isPointerWithinBothBounds = (pointer: number) => {
    const point = handler.tracker.getLastAbsoluteCoords(pointer);

    return (
      point &&
      handler.delegate.isPointerInBounds(point) &&
      otherHandler.delegate.isPointerInBounds(point)
    );
  };

  return handler.getTrackedPointersID().some(isPointerWithinBothBounds);
}

// Web-specific relation policy. Relation checks are delegated to the
// handlers (which consult the InteractionManager), while the default
// cancellation rule uses shared pointers and view overlap, which only exist
// on the web.
const webRelationPolicy: GestureRelationPolicy<IGestureHandler> = {
  shouldHandlerWaitForOther: (handler, otherHandler) =>
    handler.shouldWaitForHandlerFailure(otherHandler) ||
    otherHandler.shouldRequireToWaitForFailure(handler),

  shouldRecognizeSimultaneously: (handler, otherHandler) =>
    handler.shouldRecognizeSimultaneously(otherHandler),

  shouldBeCancelledByOther: (handler, otherHandler) =>
    handler.shouldBeCancelledByOther(otherHandler),

  shouldBeCancelledByDefault: (handler, otherHandler) => {
    const handlerPointers: number[] = handler.getTrackedPointersID();
    const otherPointers: number[] = otherHandler.getTrackedPointersID();

    if (
      !PointerTracker.shareCommonPointers(handlerPointers, otherPointers) &&
      handler.delegate.view !== otherHandler.delegate.view
    ) {
      return checkOverlap(handler, otherHandler);
    }

    return true;
  },

  shouldBeginWithRecordedHandlers: (handler, recordedHandlers) =>
    handler.shouldBeginWithRecordedHandlers(
      recordedHandlers as IGestureHandler[]
    ),
};

export default class GestureHandlerOrchestrator {
  private static _instance: GestureHandlerOrchestrator;

  private arbitrator = new GestureArbitrator<IGestureHandler>(
    webRelationPolicy
  );

  // Private beacuse of Singleton
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  public isHandlerRecorded(handler: IGestureHandler): boolean {
    return this.arbitrator.isHandlerRecorded(handler);
  }

  public removeHandlerFromOrchestrator(handler: IGestureHandler): void {
    this.arbitrator.removeHandler(handler);
  }

  public onHandlerStateChange(
    handler: IGestureHandler,
    newState: State,
    oldState: State,
    sendIfDisabled?: boolean
  ): void {
    this.arbitrator.onHandlerStateChange(
      handler,
      newState,
      oldState,
      sendIfDisabled
    );
  }

  public recordHandlerIfNotPresent(handler: IGestureHandler): void {
    this.arbitrator.recordHandlerIfNotPresent(handler);
  }

  // This function is called when handler receives touchdown event
  // If handler is using mouse or pen as a pointer and any handler receives touch event,
  // mouse/pen event dissappears - it doesn't send onPointerCancel nor onPointerUp (and others)
  // This became a problem because handler was left at active state without any signal to end or fail
  // To handle this, when new touch event is received, we loop through active handlers and check which type of
  // pointer they're using. If there are any handler with mouse/pen as a pointer, we cancel them
  public cancelMouseAndPenGestures(currentHandler: IGestureHandler): void {
    this.arbitrator.recordedHandlers.forEach((handler: IGestureHandler) => {
      if (
        handler.pointerType !== PointerType.MOUSE &&
        handler.pointerType !== PointerType.STYLUS
      ) {
        return;
      }

      if (handler !== currentHandler) {
        handler.cancel();
      } else {
        // Handler that received touch event should have its pointer tracker reset
        // This allows handler to smoothly change from mouse/pen to touch
        // The drawback is, that when we try to use mouse/pen one more time, it doesn't send onPointerDown at the first time
        // so it is required to click two times to get handler to work
        //
        // However, handler will receive manually created onPointerEnter that is triggered in EventManager in onPointerMove method.
        // There may be possibility to use that fact to make handler respond properly to first mouse click
        handler.tracker.resetTracker();
      }
    });
  }

  public static get instance(): GestureHandlerOrchestrator {
    if (!GestureHandlerOrchestrator._instance) {
      GestureHandlerOrchestrator._instance = new GestureHandlerOrchestrator();
    }

    return GestureHandlerOrchestrator._instance;
  }
}
