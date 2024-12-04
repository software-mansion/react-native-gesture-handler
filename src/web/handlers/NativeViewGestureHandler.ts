import { Platform } from 'react-native';
import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private _buttonRole!: boolean;
  // TODO: Implement logic for activation on start
  private _shouldActivateOnStart = false;
  private _disallowInterruption = false;
  private _startX = 0;
  private _startY = 0;
  private _minDistSq = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.shouldCancelWhenOutside = true;

    if (Platform.OS !== 'web') {
      return;
    }

    const view = this.delegate.getView() as HTMLElement;

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

    const view = this.delegate.getView() as HTMLElement;
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

  protected resetConfig(): void {
    super.resetConfig();
  }

  protected onPointerDown(event: AdaptedEvent): void {
    this.pointerTracker.addToTracker(event);
    super.onPointerDown(event);
    this.newPointerAction();

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.pointerTracker.addToTracker(event);
    super.onPointerAdd(event);
    this.newPointerAction();
  }

  private newPointerAction(): void {
    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    this.startX = lastCoords.x;
    this.startY = lastCoords.y;

    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.begin();
    if (this.buttonRole) {
      this.activate();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.pointerTracker.track(event);

    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
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
    this.pointerTracker.removeFromTracker(event.pointerId);

    if (this.pointerTracker.getTrackedPointersCount() === 0) {
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

  public get buttonRole() {
    return this._buttonRole;
  }
  public set buttonRole(isButton: boolean) {
    this._buttonRole = isButton;
  }

  public get shouldActivateOnStart() {
    return this._shouldActivateOnStart;
  }
  public set shouldActivateOnStart(value: boolean) {
    this._shouldActivateOnStart = value;
  }

  public get disallowInterruption() {
    return this._disallowInterruption;
  }
  public set disallowInterruption(value: boolean) {
    this._disallowInterruption = value;
  }

  public get startX() {
    return this._startX;
  }
  public set startX(value: number) {
    this._startX = value;
  }

  public get startY() {
    return this._startY;
  }
  public set startY(value: number) {
    this._startY = value;
  }

  public get minDistSq() {
    return this._minDistSq;
  }
  public set minDistSq(value: number) {
    this._minDistSq = value;
  }
}
