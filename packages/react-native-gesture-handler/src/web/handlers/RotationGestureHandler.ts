import type { ActionType } from '../../ActionType';
import { State } from '../../State';
import { SingleGestureName } from '../../v3/types';
import type { RotationGestureListener } from '../detectors/RotationGestureDetector';
import RotationGestureDetector from '../detectors/RotationGestureDetector';
import type { AdaptedEvent, PropsRef } from '../interfaces';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import GestureHandler from './GestureHandler';
import type IGestureHandler from './IGestureHandler';

const ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36;

export default class RotationGestureHandler extends GestureHandler {
  private rotation = 0;
  private velocity = 0;

  private cachedAnchorX = 0;
  private cachedAnchorY = 0;

  private rotationGestureListener: RotationGestureListener = {
    onRotationBegin: (_detector: RotationGestureDetector): boolean => true,
    onRotation: (detector: RotationGestureDetector): boolean => {
      const previousRotation: number = this.rotation;
      this.rotation += detector.rotation;

      const delta = detector.timeDelta;

      if (delta > 0) {
        this.velocity = (this.rotation - previousRotation) / delta;
      }

      if (
        Math.abs(this.rotation) >= ROTATION_RECOGNITION_THRESHOLD &&
        this.state === State.BEGAN
      ) {
        this.activate();
      }

      return true;
    },
    onRotationEnd: (_detector: RotationGestureDetector): void => {
      if (this.state === State.ACTIVE) {
        this.end();
      } else {
        this.fail();
      }
    },
  };

  private rotationGestureDetector: RotationGestureDetector =
    new RotationGestureDetector(this.rotationGestureListener);

  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    super(delegate);
    this.name = SingleGestureName.Rotation;
  }

  public override init(
    ref: number,
    propsRef: React.RefObject<PropsRef>,
    actionType: ActionType
  ): void {
    super.init(ref, propsRef, actionType);

    this.shouldCancelWhenOutside = false;
  }

  protected override transformNativeEvent() {
    const anchor = this.getAnchor();

    return {
      rotation: this.rotation ? this.rotation : 0,
      anchorX: anchor.x,
      anchorY: anchor.y,
      velocity: this.velocity ? this.velocity : 0,
    };
  }

  private getAnchor(): { x: number; y: number } {
    const absX = this.rotationGestureDetector.anchorX;
    const absY = this.rotationGestureDetector.anchorY;

    if (Number.isFinite(absX) && Number.isFinite(absY)) {
      return this.delegate.absoluteToLocal(absX, absY);
    }

    return { x: this.cachedAnchorX, y: this.cachedAnchorY };
  }

  protected override onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
  }

  protected override onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);

    this.tryBegin();
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    if (this.tracker.trackedPointersCount < 2) {
      return;
    }

    const anchor = this.getAnchor();
    this.cachedAnchorX = anchor.x;
    this.cachedAnchorY = anchor.y;

    this.tracker.track(event);

    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    super.onPointerMove(event);
  }

  protected override onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.tracker.trackedPointersCount < 2) {
      return;
    }

    const anchor = this.getAnchor();
    this.cachedAnchorX = anchor.x;
    this.cachedAnchorY = anchor.y;

    this.tracker.track(event);

    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    super.onPointerOutOfBounds(event);
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    this.tracker.removeFromTracker(event.pointerId);
  }

  protected tryBegin(): void {
    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.begin();
  }

  protected override onReset(): void {
    if (this.state === State.ACTIVE) {
      return;
    }

    this.rotation = 0;
    this.velocity = 0;
    this.rotationGestureDetector.reset();
  }
}
