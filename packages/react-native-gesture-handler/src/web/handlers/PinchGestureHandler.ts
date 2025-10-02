import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import { AdaptedEvent, GestureHandlerName, PropsRef } from '../interfaces';

import GestureHandler from './GestureHandler';
import ScaleGestureDetector, {
  ScaleGestureListener,
} from '../detectors/ScaleGestureDetector';
import { ActionType } from '../../ActionType';
import { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import IGestureHandler from './IGestureHandler';

export default class PinchGestureHandler extends GestureHandler {
  private scale = 1;
  private velocity = 0;

  private startingSpan = 0;
  private spanSlop = DEFAULT_TOUCH_SLOP;

  private scaleDetectorListener: ScaleGestureListener = {
    onScaleBegin: (detector: ScaleGestureDetector): boolean => {
      this.startingSpan = detector.currentSpan;
      return true;
    },
    onScale: (detector: ScaleGestureDetector): boolean => {
      const prevScaleFactor: number = this.scale;
      this.scale *= detector.calculateScaleFactor(
        this.tracker.trackedPointersCount
      );

      const delta = detector.timeDelta;
      if (delta > 0) {
        this.velocity = (this.scale - prevScaleFactor) / delta;
      }

      if (
        Math.abs(this.startingSpan - detector.currentSpan) >= this.spanSlop &&
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

  private scaleGestureDetector: ScaleGestureDetector = new ScaleGestureDetector(
    this.scaleDetectorListener
  );

  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    super(delegate);
    this.name = GestureHandlerName.Pinch;
  }

  public override init(
    ref: number,
    propsRef: React.RefObject<PropsRef>,
    actionType: ActionType
  ) {
    super.init(ref, propsRef, actionType);

    this.shouldCancelWhenOutside = false;
  }

  protected override transformNativeEvent() {
    return {
      focalX: this.scaleGestureDetector.focusX,
      focalY: this.scaleGestureDetector.focusY,
      velocity: this.velocity,
      scale: this.scale,
    };
  }

  protected override onPointerDown(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);

    this.tryToSendTouchEvent(event);
  }

  protected override onPointerAdd(event: AdaptedEvent): void {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.tryBegin();
    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
    if (this.state !== State.ACTIVE) {
      return;
    }
    this.scaleGestureDetector.onTouchEvent(event, this.tracker);

    if (this.state === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    this.tracker.removeFromTracker(event.pointerId);

    if (this.state === State.ACTIVE && this.tracker.trackedPointersCount < 2) {
      this.end();
    }
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    if (this.tracker.trackedPointersCount < 2) {
      return;
    }
    this.tracker.track(event);

    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    super.onPointerMove(event);
  }
  protected override onPointerOutOfBounds(event: AdaptedEvent): void {
    if (this.tracker.trackedPointersCount < 2) {
      return;
    }
    this.tracker.track(event);

    this.scaleGestureDetector.onTouchEvent(event, this.tracker);
    super.onPointerOutOfBounds(event);
  }

  private tryBegin(): void {
    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.resetProgress();
    this.begin();
  }

  public override activate(force?: boolean): void {
    if (this.state !== State.ACTIVE) {
      this.resetProgress();
    }

    super.activate(force);
  }

  protected override onReset(): void {
    this.resetProgress();
  }

  protected override resetProgress(): void {
    if (this.state === State.ACTIVE) {
      return;
    }
    this.velocity = 0;
    this.scale = 1;
  }
}
