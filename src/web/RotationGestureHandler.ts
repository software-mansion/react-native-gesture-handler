import { State } from '../State';
import { EventTypes, GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';
import RotationGestureDetector, {
  RotationGestureListener,
} from './RotationGestureDetector';

export default class RotationGestureHandler extends GestureHandler {
  private readonly ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36; // 5deg in radians

  private rotationGestureDetector: RotationGestureDetector;

  private rotation = 0;
  private velocity = 0;

  private rotationGestureListener: RotationGestureListener = {
    onRotationBegin: (_detector: RotationGestureDetector): boolean => {
      return true;
    },
    onRotation: (
      detector: RotationGestureDetector,
      event: GHEvent
    ): boolean => {
      const previousRotation: number = this.rotation;
      this.rotation += detector.getRotation();

      const delta = detector.getTimeDelta();

      if (delta > 0) {
        this.velocity = (this.rotation - previousRotation) / delta;
      }

      if (
        Math.abs(this.rotation) >= this.ROTATION_RECOGNITION_THRESHOLD &&
        this.getState() === State.BEGAN
      ) {
        this.activate(event);
      }

      return true;
    },
    onRotationEnd: (
      detector: RotationGestureDetector,
      event: GHEvent
    ): void => {
      this.end(event);
    },
  };

  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(false);
  }

  protected transformNativeEvent(event: GHEvent): any {
    return {
      rotation: this.rotation,
      anchorX: this.rotationGestureDetector.getAnchorX(),
      anchorY: this.rotationGestureDetector.getAnchorY(),
      velocity: this.velocity,
    };
  }

  get name(): string {
    throw new Error('Method not implemented.');
  }

  public getAnchorX(): number {
    const anchorX = this.rotationGestureDetector.getAnchorX();

    return anchorX ? anchorX : NaN;
  }

  public getAnchorY(): number {
    const anchorY = this.rotationGestureDetector.getAnchorY();

    return anchorY ? anchorY : NaN;
  }
  //

  protected onDownAction(event: GHEvent): void {
    this.tracker.addToTracker(event);

    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_DOWN;
      this.checkUndetermined(event);
      this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    }
  }

  protected onMoveAction(event: GHEvent): void {
    this.tracker.track(event);

    console.log('moveveee');

    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    super.onMoveAction(event);
  }

  protected onUpAction(event: GHEvent): void {
    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_UP;
      this.rotationGestureDetector.onTouchEvent(event, this.tracker);
      this.tracker.removeFromTracker(event.pointerId);
    } else {
      this.tracker.removeFromTracker(event.pointerId);
      if (this.getState() !== State.ACTIVE) return;
      this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    }

    if (event.eventType !== EventTypes.UP) return;

    if (this.getState() === State.ACTIVE) this.end(event);
    else this.fail(event);
  }

  protected checkUndetermined(event: GHEvent): void {
    if (this.getState() !== State.UNDETERMINED) return;

    this.resetProgress();
    if (!this.rotationGestureDetector) {
      this.rotationGestureDetector = new RotationGestureDetector(
        this.rotationGestureListener
      );
    }

    this.begin(event);
  }

  //
  protected activate(event: GHEvent, _force?: boolean): void {
    if (this.getState() !== State.ACTIVE) this.resetProgress();

    super.activate(event);
  }

  protected onCancel(): void {
    //throw new Error('Method not implemented.');
  }
  protected onReset(): void {
    this.resetProgress();
  }

  protected resetProgress(): void {
    this.rotation = 0;
    this.velocity = 0;
  }
}
