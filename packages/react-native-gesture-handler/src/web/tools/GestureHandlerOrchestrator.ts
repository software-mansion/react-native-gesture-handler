import { PointerType } from '../../PointerType';
import { State } from '../../State';
import type IGestureHandler from '../handlers/IGestureHandler';
import GestureArbitrator from './GestureArbitrator';
import PointerTracker from './PointerTracker';

/**
 * Web adapter for GestureArbitrator. It supplies DOM/pointer-specific conflict
 * detection and keeps the web singleton used by production handlers.
 */
export default class GestureHandlerOrchestrator {
  private static _instance: GestureHandlerOrchestrator;

  private readonly arbitrator = new GestureArbitrator(
    this.hasHandlerConflict.bind(this)
  );

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

  private hasHandlerConflict(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    if (handler.awaiting || handler.state === State.ACTIVE) {
      return handler.shouldBeCancelledByOther(otherHandler);
    }

    const handlerPointers = handler.getTrackedPointersID();
    const otherPointers = otherHandler.getTrackedPointersID();

    if (
      !PointerTracker.shareCommonPointers(handlerPointers, otherPointers) &&
      handler.delegate.view !== otherHandler.delegate.view
    ) {
      return this.checkOverlap(handler, otherHandler);
    }

    return true;
  }

  private checkOverlap(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
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

  public cancelMouseAndPenGestures(currentHandler: IGestureHandler): void {
    this.arbitrator.forEachHandler((handler) => {
      if (
        handler.pointerType !== PointerType.MOUSE &&
        handler.pointerType !== PointerType.STYLUS
      ) {
        return;
      }

      if (handler !== currentHandler) {
        handler.cancel();
      } else {
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
