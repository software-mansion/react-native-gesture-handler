import { State } from '../../State';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
import RotationGestureDetector, {
  RotationGestureListener,
} from '../detectors/RotationGestureDetector';

const ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36;

export default class RotationGestureHandler extends GestureHandler {
  private _rotation = 0;
  private _velocity = 0;
  private _cachedAnchorX = 0;
  private _cachedAnchorY = 0;
  private _rotationGestureListener: RotationGestureListener = {
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
  private _rotationGestureDetector: RotationGestureDetector =
    new RotationGestureDetector(this.rotationGestureListener);

  public init(ref: number, propsRef: React.RefObject<unknown>): void {
    super.init(ref, propsRef);

    this.shouldCancelWhenOutside = false;
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });
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
    this.pointerTracker.addToTracker(event);
    super.onPointerDown(event);

    this.tryToSendTouchEvent(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.pointerTracker.addToTracker(event);
    super.onPointerAdd(event);

    this.tryBegin();
    this.rotationGestureDetector.onTouchEvent(event, this.pointerTracker);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    if (this.pointerTracker.getTrackedPointersCount() < 2) {
      return;
    }

    if (this.getAnchorX()) {
      this.cachedAnchorX = this.getAnchorX();
    }
    if (this.getAnchorY()) {
      this.cachedAnchorY = this.getAnchorY();
    }

    this.pointerTracker.track(event);

    this.rotationGestureDetector.onTouchEvent(event, this.pointerTracker);

    super.onPointerMove(event);
  }

  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.pointerTracker.getTrackedPointersCount() < 2) {
      return;
    }

    if (this.getAnchorX()) {
      this.cachedAnchorX = this.getAnchorX();
    }
    if (this.getAnchorY()) {
      this.cachedAnchorY = this.getAnchorY();
    }

    this.pointerTracker.track(event);

    this.rotationGestureDetector.onTouchEvent(event, this.pointerTracker);

    super.onPointerOutOfBounds(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.pointerTracker.removeFromTracker(event.pointerId);
    this.rotationGestureDetector.onTouchEvent(event, this.pointerTracker);

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
    this.rotationGestureDetector.onTouchEvent(event, this.pointerTracker);
    this.pointerTracker.removeFromTracker(event.pointerId);
  }

  protected tryBegin(): void {
    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.begin();
  }

  public activate(_force?: boolean): void {
    super.activate();
  }

  protected onReset(): void {
    if (this.state === State.ACTIVE) {
      return;
    }

    this.rotation = 0;
    this.velocity = 0;
    this.rotationGestureDetector.reset();
  }

  public get rotation() {
    return this._rotation;
  }
  public set rotation(value: number) {
    this._rotation = value;
  }

  public get velocity() {
    return this._velocity;
  }
  public set velocity(value: number) {
    this._velocity = value;
  }

  public get cachedAnchorX() {
    return this._cachedAnchorX;
  }
  public set cachedAnchorX(value: number) {
    this._cachedAnchorX = value;
  }

  public get cachedAnchorY() {
    return this._cachedAnchorY;
  }
  public set cachedAnchorY(value: number) {
    this._cachedAnchorY = value;
  }

  public get rotationGestureListener(): RotationGestureListener {
    return this._rotationGestureListener;
  }
  public set rotationGestureListener(listener: RotationGestureListener) {
    this._rotationGestureListener = listener;
  }

  public get rotationGestureDetector(): RotationGestureDetector {
    return this._rotationGestureDetector;
  }
  public set rotationGestureDetector(detector: RotationGestureDetector) {
    this._rotationGestureDetector = detector;
  }
}
