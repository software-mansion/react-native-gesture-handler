import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { EventTypes, GHEvent } from '../tools/EventManager';
import GestureHandler from './GestureHandler';
import ScaleGestureDetector, {
  ScaleGestureListener,
} from '../detectors/ScaleGestureDetector';
import { PropsRef } from '../interfaces';

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
    onScale: (detector: ScaleGestureDetector, event: GHEvent): boolean => {
      const prevScaleFactor: number = this.scale;
      this.scale *= detector.getScaleFactor(
        this.tracker.getTrackedPointersNumber()
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
    onScaleEnd: (_detector: ScaleGestureDetector): void => {
      //
    },
  };

  private scaleGestureDetector: ScaleGestureDetector = new ScaleGestureDetector(
    this.scaleDetectorListener
  );

  public init(ref: number, propsRef: React.RefObject<PropsRef>) {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(false);
  }

  protected transformNativeEvent(_event: GHEvent) {
    return {
      focalX: this.scaleGestureDetector.getFocusX(),
      focalY: this.scaleGestureDetector.getFocusY(),
      velocity: this.velocity,
      scale: this.scale,
    };
  }

  get name(): string {
    return 'pinch';
  }

  protected onDownAction(event: GHEvent): void {
    super.onDownAction(event);

    this.tracker.addToTracker(event);

    if (this.tracker.getTrackedPointersNumber() < 2) return;

    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_DOWN;
      this.checkUndetermined(event);
      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    }
  }
  protected onUpAction(event: GHEvent): void {
    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_UP;
      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
      this.tracker.removeFromTracker(event.pointerId);
    } else {
      this.tracker.removeFromTracker(event.pointerId);
      if (this.currentState !== State.ACTIVE) return;
      this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    }
    if (
      this.currentState === State.ACTIVE &&
      this.tracker.getTrackedPointersNumber() < 2
    ) {
      this.end(event);
    } else if (
      event.eventType === EventTypes.UP &&
      this.currentState !== State.BEGAN
    ) {
      this.fail(event);
    }
  }
  protected onMoveAction(event: GHEvent): void {
    if (this.tracker.getTrackedPointersNumber() < 2) return;
    this.tracker.track(event);

    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    super.onMoveAction(event);
  }
  protected onOutOfBoundsAction(_event: GHEvent): void {
    //
  }

  protected onCancelAction(_event: GHEvent): void {
    this.reset();
  }

  private checkUndetermined(event: GHEvent): void {
    if (this.currentState !== State.UNDETERMINED) return;

    this.resetProgress();

    this.spanSlop = DEFAULT_TOUCH_SLOP;

    this.begin(event);
  }

  protected activate(event: GHEvent, force?: boolean): void {
    if (this.currentState !== State.ACTIVE) this.resetProgress();

    super.activate(event, force);
  }

  protected onCancel(): void {
    //
  }
  protected onReset(): void {
    // this.getScaleGestureDetector = null;
    this.resetProgress();
    //
  }

  protected resetProgress(): void {
    if (this.currentState === State.ACTIVE) return;
    this.velocity = 0;
    this.scale = 1;
  }
}
