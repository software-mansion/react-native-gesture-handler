import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private buttonRole!: boolean;

  //TODO: Implement logic for activation on start
  //@ts-ignore Logic yet to be implemented
  private shouldActivateOnStart = false;
  private disallowInterruption = false;

  private startX = 0;
  private startY = 0;
  private minDistSq = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);

    this.view.style['touchAction'] = 'auto';

    //@ts-ignore Turns on defualt touch behavior on Safari
    this.view.style['WebkitTouchCallout'] = 'auto';

    if (this.view.hasAttribute('role')) {
      this.buttonRole = true;
    } else {
      this.buttonRole = false;
    }
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
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
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.newPointerAction();
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.newPointerAction();
  }

  private newPointerAction(): void {
    this.startX = this.tracker.getLastAvgX();
    this.startY = this.tracker.getLastAvgY();

    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.begin();
    if (this.buttonRole) {
      this.activate();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);

    const dx = this.startX - this.tracker.getLastAvgX();
    const dy = this.startY - this.tracker.getLastAvgY();
    const distSq = dx * dx + dy * dy;

    if (distSq >= this.minDistSq) {
      if (this.buttonRole && this.currentState === State.ACTIVE) {
        this.cancel();
      } else if (!this.buttonRole && this.currentState === State.BEGAN) {
        this.activate();
      }
    }
  }

  protected onPointerOut(): void {
    if (
      this.currentState === State.BEGAN ||
      this.currentState === State.ACTIVE
    ) {
      this.cancel();
    }
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.onUp(event);
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.onUp(event);
  }

  private onUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.tracker.getTrackedPointersCount() === 0) {
      if (this.currentState === State.ACTIVE) {
        this.end();
      } else {
        this.fail();
      }
    }
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
