import { type ActionType } from '@swmansion/gesture-handler-core/src/ActionType';
import { State } from '@swmansion/gesture-handler-core/src/State';
import type { NativeHandlerData } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/native/NativeTypes';
import type { HandlerData } from '@swmansion/gesture-handler-core/src/v3/types';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types';

import {
  DEFAULT_TOUCH_SLOP,
  NATIVE_GESTURE_ROLE_ATTRIBUTE,
} from '../constants';
import type {
  AdaptedEvent,
  Config,
  HostDetector,
  PropsRef,
} from '../interfaces';
import { NativeGestureRole } from '../interfaces';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import {
  dispatchGestureLifecycleEvent,
  GestureLifecycleEvent,
} from '../tools/GestureLifecycleEvents';
import GestureHandler from './GestureHandler';
import type IGestureHandler from './IGestureHandler';

export default class NativeViewGestureHandler extends GestureHandler {
  public override readonly isContinuous = true;
  private role: NativeGestureRole | null = null;

  // TODO: Implement logic for activation on start properly
  private shouldActivateOnStart = false;
  private disallowInterruption = false;
  private yieldsToContinuousGestures = false;

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
    actionType: ActionType,
    hostDetector: HostDetector | null = null
  ): void {
    super.init(ref, propsRef, actionType, hostDetector);

    this.shouldCancelWhenOutside = true;

    // Environment guard replacing the former Platform.OS check: init() must be a
    // no-op when there is no DOM (e.g. the module is loaded in a windows/node
    // runtime that only wants the handler classes).
    if (typeof window === 'undefined') {
      return;
    }

    const view = this.delegate.view as HTMLElement;

    this.restoreViewStyles(view);

    if (this.usesNativeOrVirtualDetector()) {
      this.role =
        (view.getAttribute(
          NATIVE_GESTURE_ROLE_ATTRIBUTE
        ) as NativeGestureRole) ?? null;
    } else {
      if (view.getAttribute('role') === 'button') {
        this.role = NativeGestureRole.Button;
      } else if (view.querySelector(':scope > input[role="switch"]') !== null) {
        this.role = NativeGestureRole.Switch;
      }
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
    if (config.yieldsToContinuousGestures !== undefined) {
      this.yieldsToContinuousGestures = config.yieldsToContinuousGestures;
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

    dispatchGestureLifecycleEvent(
      this.delegate.view as HTMLElement | null,
      GestureLifecycleEvent.Began
    );

    const view = this.delegate.view as HTMLElement;
    const isRNGHText = view.hasAttribute('rnghtext');

    if (
      (this.role === NativeGestureRole.Button && this.shouldActivateOnStart) ||
      this.role === NativeGestureRole.Switch ||
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
      this.role === NativeGestureRole.Switch ||
      this.role === NativeGestureRole.Button
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
        this.role === NativeGestureRole.Button &&
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
      handler.disallowsInterruption() &&
      !handler.yieldsToContinuousGestures
    ) {
      return false;
    }

    const canBeInterrupted =
      !this.disallowInterruption ||
      (this.yieldsToContinuousGestures && handler.isContinuous);

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

  public override detach(): void {
    super.detach();
    this.role = null;
  }

  public override shouldBeCancelledByOther(handler: IGestureHandler): boolean {
    return (
      !this.disallowInterruption ||
      (this.yieldsToContinuousGestures && handler.isContinuous)
    );
  }

  public override shouldAttachGestureToChildView(): boolean {
    return true;
  }

  public disallowsInterruption(): boolean {
    return this.disallowInterruption;
  }

  public isButton(): boolean {
    return this.role === NativeGestureRole.Button;
  }

  public override shouldBeginWithRecordedHandlers(
    recorded: IGestureHandler[]
  ): boolean {
    if (!this.isButton()) {
      return true;
    }

    const self = this as IGestureHandler;
    return recorded.every(
      (other) =>
        other.shouldRecognizeSimultaneously(self) ||
        self.shouldRecognizeSimultaneously(other) ||
        other.delegate.view === this.delegate.view ||
        other.name === SingleGestureName.Hover
    );
  }

  protected override onCancel(): void {
    super.onCancel();
    dispatchGestureLifecycleEvent(
      this.delegate.view as HTMLElement | null,
      GestureLifecycleEvent.Canceled
    );
  }

  protected override transformNativeEvent(): Record<string, unknown> {
    const absolute = this.tracker.getAbsoluteCoordsAverage();
    const relative = this.tracker.getRelativeCoordsAverage();
    return {
      pointerInside: this.delegate.isPointerInBounds(absolute),
      x: relative.x,
      y: relative.y,
      absoluteX: absolute.x,
      absoluteY: absolute.y,
    };
  }

  private arePointerStatesEqual(
    a: HandlerData<NativeHandlerData>,
    b: HandlerData<NativeHandlerData>
  ): boolean {
    return (
      a.pointerInside === b.pointerInside &&
      a.numberOfPointers === b.numberOfPointers &&
      a.pointerType === b.pointerType
    );
  }

  protected override shouldSuppressActiveUpdate(
    handlerData: HandlerData<NativeHandlerData>
  ): boolean {
    const last = this.lastActiveHandlerData;
    if (last && this.arePointerStatesEqual(last, handlerData)) {
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
