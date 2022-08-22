import { State } from '../../State';
import { AdaptedEvent } from '../interfaces';

import GestureHandler from './GestureHandler';
import RotationGestureDetector, {
  RotationGestureListener,
} from '../detectors/RotationGestureDetector';

const ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36;

export default class RotationGestureHandler extends GestureHandler {
  private rotation = 0;
  private velocity = 0;

  private cachedAnchorX = 0;
  private cachedAnchorY = 0;

  private rotationGestureListener: RotationGestureListener = {
    onRotationBegin: (_detector: RotationGestureDetector): boolean => true,
    onRotation: (
      detector: RotationGestureDetector,
      event: AdaptedEvent
    ): boolean => {
      const previousRotation: number = this.rotation;
      this.rotation += detector.getRotation();

      const delta = detector.getTimeDelta();

      if (delta > 0) {
        this.velocity = (this.rotation - previousRotation) / delta;
      }

      if (
        Math.abs(this.rotation) >= ROTATION_RECOGNITION_THRESHOLD &&
        this.currentState === State.BEGAN
      ) {
        this.activate(event);
      }

      return true;
    },
    onRotationEnd: (
      _detector: RotationGestureDetector,
      event: AdaptedEvent
    ): void => {
      this.end(event);
    },
  };

  private rotationGestureDetector: RotationGestureDetector = new RotationGestureDetector(
    this.rotationGestureListener
  );

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(false);
  }

  public updateGestureConfig({ enabled = true, ...props }): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    this.enabled = enabled;
  }

  protected transformNativeEvent(_event: AdaptedEvent) {
    return {
      rotation: this.rotation ? this.rotation : 0,
      anchorX: this.getAnchorX(),
      anchorY: this.getAnchorY(),
      velocity: this.velocity ? this.velocity : 0,
    };
  }

  public getAnchorX(): number {
    const anchorX = this.rotationGestureDetector.getAnchorX();

    return anchorX ? anchorX : this.cachedAnchorX;
  }

  public getAnchorY(): number {
    const anchorY = this.rotationGestureDetector.getAnchorY();

    return anchorY ? anchorY : this.cachedAnchorY;
  }

  protected onPointerDown(event: AdaptedEvent): void {
    super.onPointerDown(event);
    this.tracker.addToTracker(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);

    this.tryBegin(event);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    if (this.tracker.getTrackedPointersCount() < 2) {
      return;
    }

    if (this.getAnchorX()) {
      this.cachedAnchorX = this.getAnchorX();
    }
    if (this.getAnchorY()) {
      this.cachedAnchorY = this.getAnchorY();
    }

    this.tracker.track(event);

    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    super.onPointerMove(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    if (this.currentState !== State.ACTIVE) {
      return;
    }

    if (this.currentState === State.ACTIVE) {
      this.end(event);
    } else {
      this.fail(event);
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    this.tracker.removeFromTracker(event.pointerId);
  }

  protected onPointerCancel(event: AdaptedEvent): void {
    this.end(event);
    this.reset();
  }

  protected tryBegin(event: AdaptedEvent): void {
    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.resetProgress();

    this.begin(event);
  }

  protected activate(event: AdaptedEvent, _force?: boolean): void {
    if (this.currentState !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(event);
  }

  protected onReset(): void {
    if (this.currentState === State.ACTIVE) {
      return;
    }

    this.rotation = 0;
    this.velocity = 0;
  }
}
