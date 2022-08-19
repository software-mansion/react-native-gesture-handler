import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent } from '../interfaces';

import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private buttonRole!: boolean;

  private shouldActivateOnStart = false;
  private disallowInterruption = false;

  private startX = 0;
  private startY = 0;
  private minDistSq = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP; //10;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);

    if (!this.view) {
      return;
    }

    this.view.style['touchAction'] = 'auto';
    // this.view.style['webkitUserSelect'] = 'auto';
    // this.view.style['userSelect'] = 'auto';

    //@ts-ignore Turns off defualt touch behavior on Safari
    this.view.style['WebkitTouchCallout'] = 'auto';

    if (this.view.hasAttribute('role')) {
      this.buttonRole = true;
    } else {
      this.buttonRole = false;
    }
  }

  public updateGestureConfig({ enabled = true, ...props }): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    if (this.config.shouldActivateOnStart !== undefined) {
      this.shouldActivateOnStart = this.config.shouldActivateOnStart;
    }
    if (this.config.disallowInterruption !== undefined) {
      this.disallowInterruption = this.config.disallowInterruption;
    }
  }

  protected resetConfig(): void {
    super.resetConfig();
  }

  protected onPointerDown(event: AdaptedEvent): void {
    super.onPointerDown(event);
    this.tracker.addToTracker(event);

    this.startX = event.x;
    this.startY = event.y;

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

  protected onPointerMove(event: AdaptedEvent): void {
    const dx = this.startX - event.x;
    const dy = this.startY - event.y;
    const distSq = dx * dx + dy * dy;

    if (
      !this.buttonRole &&
      distSq >= this.minDistSq &&
      this.currentState === State.BEGAN
    ) {
      this.activate(event);
    }
  }

  protected onPointerOut(event: AdaptedEvent): void {
    this.cancel(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.tracker.getTrackedPointersCount() === 0) {
      if (this.currentState === State.ACTIVE) {
        this.end(event);
      } else {
        this.fail(event);
      }
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
