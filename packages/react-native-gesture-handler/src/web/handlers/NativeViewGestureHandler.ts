import { Platform } from 'react-native';

import type { ActionType } from '../../ActionType';
import { State } from '../../State';
import { deepEqual } from '../../utils';
import type { NativeHandlerData } from '../../v3/hooks/gestures/native/NativeTypes';
import type { HandlerData } from '../../v3/types';
import { SingleGestureName } from '../../v3/types';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import type { AdaptedEvent, Config, PropsRef } from '../interfaces';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import GestureHandler from './GestureHandler';
import type IGestureHandler from './IGestureHandler';

enum ControlType {
  Button,
  Switch,
  TextInput,
  Other,
}

export default class NativeViewGestureHandler extends GestureHandler {
  private controlType!: ControlType;

  // TODO: Implement logic for activation on start properly
  private shouldActivateOnStart = false;
  private disallowInterruption = false;

  private startX = 0;
  private startY = 0;
  private minDistSq = DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP;

  private lastActiveHandlerData: HandlerData<NativeHandlerData> | null = null;

  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    super(delegate);
    this.name = SingleGestureName.Native;
  }

  public override init(
    ref: number,
    propsRef: React.RefObject<PropsRef>,
    actionType: ActionType
  ): void {
    super.init(ref, propsRef, actionType);

    this.shouldCancelWhenOutside = true;

    if (Platform.OS !== 'web') {
      return;
    }

    const view = this.delegate.view as HTMLElement;

    this.restoreViewStyles(view);

    if (view.getAttribute('role') === 'button') {
      this.controlType = ControlType.Button;
    } else if (view.querySelector('input[role="switch"]') !== null) {
      this.controlType = ControlType.Switch;
    } else if (view.matches('input:not([role]), textarea')) {
      this.controlType = ControlType.TextInput;
    } else {
      this.controlType = ControlType.Other;
    }
  }

  public override updateGestureConfig(config: Config): void {
    super.updateGestureConfig(config);

    if (config.shouldActivateOnStart !== undefined) {
      this.shouldActivateOnStart = config.shouldActivateOnStart;
    }
    if (config.disallowInterruption !== undefined) {
      this.disallowInterruption = config.disallowInterruption;
    }

    const view = this.delegate.view as HTMLElement;
    this.restoreViewStyles(view);
  }

  private restoreViewStyles(view: HTMLElement) {
    if (!view) {
      return;
    }

    view.style['touchAction'] = 'auto';
    // @ts-ignore Turns on default touch behavior on Safari
    view.style['WebkitTouchCallout'] = 'auto';
  }

  protected override onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.newPointerAction();
  }

  protected override onPointerAdd(event: AdaptedEvent): void {
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

    if (
      (this.controlType === ControlType.Button && this.shouldActivateOnStart) ||
      this.controlType === ControlType.Switch ||
      isRNGHText
    ) {
      this.activate();
    }
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    this.tracker.track(event);

    const lastCoords = this.tracker.getAbsoluteCoordsAverage();
    const dx = this.startX - lastCoords.x;
    const dy = this.startY - lastCoords.y;
    const distSq = dx * dx + dy * dy;

    if (
      this.controlType === ControlType.Switch ||
      this.controlType === ControlType.Button
    ) {
      return;
    }

    if (distSq >= this.minDistSq && this.state === State.BEGAN) {
      this.activate();
    }
  }

  protected override onPointerLeave(): void {
    if (this.state === State.BEGAN || this.state === State.ACTIVE) {
      this.cancel();
    }
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.onUp(event);
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.onUp(event);
  }

  private onUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.tracker.trackedPointersCount === 0) {
      if (
        this.controlType === ControlType.Button &&
        this.state === State.BEGAN
      ) {
        this.activate();
      }

      if (this.state === State.ACTIVE) {
        this.end();
      } else {
        this.fail();
      }
    }
  }

  public override shouldRecognizeSimultaneously(
    handler: IGestureHandler
  ): boolean {
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

  public override shouldBeCancelledByOther(_handler: IGestureHandler): boolean {
    return !this.disallowInterruption;
  }

  public override shouldAttachGestureToChildView(): boolean {
    return true;
  }

  public disallowsInterruption(): boolean {
    return this.disallowInterruption;
  }

  public isButton(): boolean {
    return this.controlType === ControlType.Button;
  }

  protected override transformNativeEvent(): Record<string, unknown> {
    return {
      pointerInside: this.delegate.isPointerInBounds(
        this.tracker.getAbsoluteCoordsAverage()
      ),
    };
  }

  protected override shouldSuppressActiveUpdate(
    handlerData: HandlerData<NativeHandlerData>
  ): boolean {
    if (
      this.lastActiveHandlerData &&
      deepEqual(this.lastActiveHandlerData, handlerData)
    ) {
      return true;
    }
    this.lastActiveHandlerData = handlerData;
    return false;
  }

  public override reset(): void {
    super.reset();
    this.lastActiveHandlerData = null;
  }
}
