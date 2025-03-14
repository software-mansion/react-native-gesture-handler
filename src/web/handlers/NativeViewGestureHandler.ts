import { Platform } from 'react-native';
import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private buttonRole!: boolean;

  // TODO: Implement logic for activation on start
  // @ts-ignore Logic yet to be implemented
  private shouldActivateOnStart = false;
  private disallowInterruption = false;

  private startX = 0;
  private startY = 0;
  private minDistSq = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.shouldCancelWhenOutside = true;

    if (Platform.OS !== 'web') {
      return;
    }

    const view = this.delegate.view as HTMLElement;

    this.restoreViewStyles(view);
    this.buttonRole = view.getAttribute('role') === 'button';
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    if (this.config.shouldActivateOnStart !== undefined) {
      this.shouldActivateOnStart = this.config.shouldActivateOnStart;
    }
    if (this.config.disallowInterruption !== undefined) {
      this.disallowInterruption = this.config.disallowInterruption;
    }

    const view = this.delegate.view as HTMLElement;
    this.restoreViewStyles(view);
  }

  private restoreViewStyles(view: HTMLElement) {
    if (!view) {
      return;
    }

    view.style['touchAction'] = 'auto';
    // @ts-ignore Turns on defualt touch behavior on Safari
    view.style['WebkitTouchCallout'] = 'auto';
  }

  protected onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.newPointerAction();

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.newPointerAction();
  }

  private newPointerAction(): void {
    const lastCoords = this.tracker.getAbsoluteCoordsAverage();
    this.startX = lastCoords.x;
    this.startY = lastCoords.y;

    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.begin();

    const view = this.delegate.view as HTMLElement;
    const isRNGHText = view.hasAttribute('rnghtext');

    if (this.buttonRole || isRNGHText) {
      this.activate();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);

    const lastCoords = this.tracker.getAbsoluteCoordsAverage();
    const dx = this.startX - lastCoords.x;
    const dy = this.startY - lastCoords.y;
    const distSq = dx * dx + dy * dy;

    if (distSq >= this.minDistSq) {
      if (this.buttonRole && this.state === State.ACTIVE) {
        this.cancel();
      } else if (!this.buttonRole && this.state === State.BEGAN) {
        this.activate();
      }
    }
  }

  protected onPointerLeave(): void {
    if (this.state === State.BEGAN || this.state === State.ACTIVE) {
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

    if (this.tracker.trackedPointersCount === 0) {
      if (this.state === State.ACTIVE) {
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
      handler.state === State.ACTIVE &&
      handler.disallowsInterruption()
    ) {
      return false;
    }

    const canBeInterrupted = !this.disallowInterruption;

    if (
      this.state === State.ACTIVE &&
      handler.state === State.ACTIVE &&
      canBeInterrupted
    ) {
      return false;
    }

    return (
      this.state === State.ACTIVE && canBeInterrupted && handler.handlerTag > 0
    );
  }

  public shouldBeCancelledByOther(_handler: GestureHandler): boolean {
    return !this.disallowInterruption;
  }

  public disallowsInterruption(): boolean {
    return this.disallowInterruption;
  }

  public isButton(): boolean {
    return this.buttonRole;
  }
}
