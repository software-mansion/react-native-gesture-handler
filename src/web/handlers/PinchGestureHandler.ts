import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, Config } from '../interfaces';

import GestureHandler from './GestureHandler';
import ScaleGestureDetector, {
  ScaleGestureListener,
} from '../detectors/ScaleGestureDetector';

export default class PinchGestureHandler extends GestureHandler {
  private _scale = 1;
  get scale() {
    return this._scale;
  }
  set scale(value: number) {
    this._scale = value;
  }

  private _velocity = 0;
  get velocity() {
    return this._velocity;
  }
  set velocity(value: number) {
    this._velocity = value;
  }

  private _startingSpan = 0;
  get startingSpan() {
    return this._startingSpan;
  }
  set startingSpan(value: number) {
    this._startingSpan = value;
  }

  private _spanSlop = DEFAULT_TOUCH_SLOP;
  get spanSlop() {
    return this._spanSlop;
  }
  set spanSlop(value: number) {
    this._spanSlop = value;
  }

  private _scaleDetectorListener: ScaleGestureListener = {
    onScaleBegin: (detector: ScaleGestureDetector): boolean => {
      this.startingSpan = detector.getCurrentSpan();
      return true;
    },
    onScale: (detector: ScaleGestureDetector): boolean => {
      const prevScaleFactor: number = this.scale;
      this.scale *= detector.getScaleFactor(
        this.pointerTracker.getTrackedPointersCount()
      );

      const delta = detector.getTimeDelta();
      if (delta > 0) {
        this.velocity = (this.scale - prevScaleFactor) / delta;
      }

      if (
        Math.abs(this.startingSpan - detector.getCurrentSpan()) >=
          this.spanSlop &&
        this.state === State.BEGAN
      ) {
        this.activate();
      }
      return true;
    },
    onScaleEnd: (
      _detector: ScaleGestureDetector
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    ): void => {},
  };

  get scaleDetectorListener() {
    return this._scaleDetectorListener;
  }
  set scaleDetectorListener(listener: ScaleGestureListener) {
    this._scaleDetectorListener = listener;
  }

  private _scaleGestureDetector: ScaleGestureDetector =
    new ScaleGestureDetector(this.scaleDetectorListener);
  get scaleGestureDetector() {
    return this._scaleGestureDetector;
  }
  set scaleGestureDetector(detector: ScaleGestureDetector) {
    this._scaleGestureDetector = detector;
  }

  public init(ref: number, propsRef: React.RefObject<unknown>) {
    super.init(ref, propsRef);

    this.shouldCancelWhenOutside = false;
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });
  }

  protected transformNativeEvent() {
    return {
      focalX: this.scaleGestureDetector.getFocusX(),
      focalY: this.scaleGestureDetector.getFocusY(),
      velocity: this.velocity,
      scale: this.scale,
    };
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
    this.scaleGestureDetector.onTouchEvent(event, this.pointerTracker);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.pointerTracker.removeFromTracker(event.pointerId);
    if (this.state !== State.ACTIVE) {
      return;
    }
    this.scaleGestureDetector.onTouchEvent(event, this.pointerTracker);

    if (this.state === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.scaleGestureDetector.onTouchEvent(event, this.pointerTracker);
    this.pointerTracker.removeFromTracker(event.pointerId);

    if (
      this.state === State.ACTIVE &&
      this.pointerTracker.getTrackedPointersCount() < 2
    ) {
      this.end();
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    if (this.pointerTracker.getTrackedPointersCount() < 2) {
      return;
    }
    this.pointerTracker.track(event);

    this.scaleGestureDetector.onTouchEvent(event, this.pointerTracker);
    super.onPointerMove(event);
  }
  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.pointerTracker.getTrackedPointersCount() < 2) {
      return;
    }
    this.pointerTracker.track(event);

    this.scaleGestureDetector.onTouchEvent(event, this.pointerTracker);
    super.onPointerOutOfBounds(event);
  }

  private tryBegin(): void {
    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.resetProgress();
    this.begin();
  }

  public activate(force?: boolean): void {
    if (this.state !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(force);
  }

  protected onReset(): void {
    this.resetProgress();
  }

  protected resetProgress(): void {
    if (this.state === State.ACTIVE) {
      return;
    }
    this.velocity = 0;
    this.scale = 1;
  }
}
