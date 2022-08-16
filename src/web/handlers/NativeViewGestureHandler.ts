import { State } from '../../State';
import { AdaptedEvent } from '../interfaces';
import TouchEventManager from '../tools/TouchEventManager';

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

    //@ts-ignore Turns off defualt touch behavior on Safari
    this.view.style['WebkitTouchCallout'] = 'auto';

    if (this.view.hasAttribute('role')) {
      this.buttonRole = true;
    } else {
      this.buttonRole = false;
    }

    // this.eventManager = new TouchEventManager(this.view);
    // this.eventManager.setOnPointerDown(this.onPointerDown.bind(this));

    // this.eventManager.setListeners();
  }

  protected resetConfig(): void {
    super.resetConfig();
  }

  protected onPointerDown(event: AdaptedEvent): void {
    super.onPointerDown(event);
    this.tracker.addToTracker(event);

    if (this.currentState === State.UNDETERMINED) {
      this.begin(event);
      if (this.buttonRole) {
        this.activate(event);
      }
    }
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.onPointerDown(event);
  }

  protected onPointerMove(_event: AdaptedEvent): void {
    //
  }

  protected onPointerOut(event: AdaptedEvent): void {
    this.cancel(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    if (!this.buttonRole) {
      this.activate(event);
    }
    if (this.tracker.getTrackedPointersCount() === 0) {
      this.end(event);
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    this.onPointerUp(event);
  }

  protected onPointerCancel(event: AdaptedEvent): void {
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
