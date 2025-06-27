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
      this.end();
    },
  };

  private rotationGestureDetector: RotationGestureDetector =
    new RotationGestureDetector(this.rotationGestureListener);

  public init(ref: Element, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.shouldCancelWhenOutside = false;
  }

  protected transformNativeEvent() {
    return {
      rotation: this.rotation ? this.rotation : 0,
      anchorX: this.getAnchorX(),
      anchorY: this.getAnchorY(),
      velocity: this.velocity ? this.velocity : 0,
    };
  }

  public getAnchorX(): number {
    const anchorX = this.rotationGestureDetector.anchorX;

    return anchorX ? anchorX : this.cachedAnchorX;
  }

  public getAnchorY(): number {
    const anchorY = this.rotationGestureDetector.anchorY;

    return anchorY ? anchorY : this.cachedAnchorY;
  }

  protected onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);

    this.tryBegin();
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    if (this.tracker.trackedPointersCount < 2) {
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

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.tracker.trackedPointersCount < 2) {
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

    super.onPointerOutOfBounds(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    if (this.state !== State.ACTIVE) {
      return;
    }

    if (this.state === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
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

  protected onReset(): void {
    if (this.state === State.ACTIVE) {
      return;
    }

    this.rotation = 0;
    this.velocity = 0;
    this.rotationGestureDetector.reset();
  }
}
