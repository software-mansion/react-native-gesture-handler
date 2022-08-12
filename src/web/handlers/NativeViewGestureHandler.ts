import { State } from '../../State';
import { AdaptedPointerEvent } from '../interfaces';

import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private buttonRole!: boolean;

  private disallowInterruption = false;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);

    if (!this.view) {
      return;
    }

    this.view.style['touchAction'] = 'auto';
    this.view.style['webkitUserSelect'] = 'auto';
    this.view.style['userSelect'] = 'auto';

    //@ts-ignore Turns on defualt touch behavior on Safari
    this.view.style['WebkitTouchCallout'] = 'auto';

    if (this.view.hasAttribute('role')) {
      this.buttonRole = true;
    } else {
      this.buttonRole = false;
    }
  }

  protected resetConfig(): void {
    super.resetConfig();
  }

  protected onPointerDown(event: AdaptedPointerEvent): void {
    super.onPointerDown(event);
    this.tracker.addToTracker(event);

    if (this.currentState === State.UNDETERMINED) {
      this.begin(event);
      if (this.buttonRole) {
        this.activate(event);
      }
    }
  }

  protected onPointerMove(_event: AdaptedPointerEvent): void {
    //
  }

  protected onPointerOut(event: AdaptedPointerEvent): void {
    this.cancel(event);
  }

  protected onPointerUp(event: AdaptedPointerEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    if (!this.buttonRole) {
      this.activate(event);
    }
    if (this.tracker.getTrackedPointersCount() === 0) {
      this.end(event);
    }
  }

  protected onPointerCancel(event: AdaptedPointerEvent): void {
    this.cancel(event);
    this.reset();
  }

  public shouldRecognizeSimultaneously(handler: GestureHandler): boolean {
    if (super.shouldRecognizeSimultaneously(handler)) {
      return true;
    }

    if (
      handler instanceof NativeViewGestureHandler &&
      handler.getState() === State.ACTIVE &&
      handler.disallowsInterruption()
    ) {
      return false;
    }

    const canBeInterrupted = !this.disallowInterruption;

    if (
      this.currentState === State.ACTIVE &&
      handler.getState() === State.ACTIVE &&
      canBeInterrupted
    ) {
      return false;
    }

    return (
      this.currentState === State.ACTIVE &&
      canBeInterrupted &&
      handler.getTag() > 0
    );
  }

  public shouldBeCancelledByOther(_handler: GestureHandler): boolean {
    return !this.disallowInterruption;
  }

  public disallowsInterruption(): boolean {
    return this.disallowInterruption;
  }
}
