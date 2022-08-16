import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent } from '../interfaces';

import GestureHandler from './GestureHandler';
import ScaleGestureDetector, {
  ScaleGestureListener,
} from '../detectors/ScaleGestureDetector';

export default class PinchGestureHandler extends GestureHandler {
  private scale = 1;
  private velocity = 0;

  private startingSpan = 0;
  private spanSlop = 0;

  private scaleDetectorListener: ScaleGestureListener = {
    onScaleBegin: (detector: ScaleGestureDetector): boolean => {
      this.startingSpan = detector.getCurrentSpan();
      return true;
    },
    onScale: (detector: ScaleGestureDetector, event: AdaptedEvent): boolean => {
      const prevScaleFactor: number = this.scale;
      this.scale *= detector.getScaleFactor(
        this.tracker.getTrackedPointersCount()
      );

      const delta = detector.getTimeDelta();
      if (delta > 0) {
        this.velocity = (this.scale - prevScaleFactor) / delta;
      }

      if (
        Math.abs(this.startingSpan - detector.getCurrentSpan()) >=
          this.spanSlop &&
        this.currentState === State.BEGAN
      ) {
        this.activate(event);
      }
      return true;
    },
    onScaleEnd: (
      _detector: ScaleGestureDetector,
      _event: AdaptedEvent
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    ): void => {},
  };

  private scaleGestureDetector: ScaleGestureDetector = new ScaleGestureDetector(
    this.scaleDetectorListener
  );

  public init(ref: number, propsRef: React.RefObject<unknown>) {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(false);
  }

  public updateGestureConfig({ enabled = true, ...props }): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    this.enabled = enabled;
  }

  protected transformNativeEvent(_event: AdaptedEvent) {
    return {
      focalX: this.scaleGestureDetector.getFocusX(),
      focalY: this.scaleGestureDetector.getFocusY(),
      velocity: this.velocity,
      scale: this.scale,
    };
  }

  protected onPointerDown(event: AdaptedEvent): void {
    super.onPointerDown(event);
    this.tracker.addToTracker(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    this.tryBegin(event);
    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    if (this.currentState !== State.ACTIVE) {
      return;
    }
    this.scaleGestureDetector.onTouchEvent(event, this.tracker);

    if (this.currentState === State.ACTIVE) {
      this.end(event);
    } else {
      this.fail(event);
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    this.tracker.removeFromTracker(event.pointerId);

    if (
      this.currentState === State.ACTIVE &&
      this.tracker.getTrackedPointersCount() < 2
    ) {
      this.end(event);
    }
  }

  protected onPointerMove(event: AdaptedEvent): void {
    if (this.tracker.getTrackedPointersCount() < 2) {
      return;
    }
    this.tracker.track(event);

    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    super.onPointerMove(event);
  }
  protected onPointerOutOfBounds(_event: AdaptedEvent): void {
    //
  }

  protected onPointerCancel(_event: AdaptedEvent): void {
    this.reset();
  }

  private tryBegin(event: AdaptedEvent): void {
    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.resetProgress();

    this.spanSlop = DEFAULT_TOUCH_SLOP;

    this.begin(event);
  }

  protected activate(event: AdaptedEvent, force?: boolean): void {
    if (this.currentState !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(event, force);
  }

  protected onReset(): void {
    this.resetProgress();
  }

  protected resetProgress(): void {
    if (this.currentState === State.ACTIVE) {
      return;
    }
    this.velocity = 0;
    this.scale = 1;
  }
}
