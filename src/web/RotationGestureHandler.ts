import { State } from '../State';
import { EventTypes, GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';
import RotationGestureDetector, {
  RotationGestureListener,
} from './RotationGestureDetector';

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
      event: GHEvent
    ): boolean => {
      const previousRotation: number = this.rotation;
      this.rotation += detector.getRotation();

      const delta = detector.getTimeDelta();

      if (delta > 0) {
        this.velocity = (this.rotation - previousRotation) / delta;
      }

      if (
        Math.abs(this.rotation) >= ROTATION_RECOGNITION_THRESHOLD &&
        this.getState() === State.BEGAN
      ) {
        this.activate(event);
      }

      return true;
    },
    onRotationEnd: (
      _detector: RotationGestureDetector,
      event: GHEvent
    ): void => {
      this.end(event);
    },
  };

  private rotationGestureDetector: RotationGestureDetector = new RotationGestureDetector(
    this.rotationGestureListener
  );

  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(false);
  }

  protected transformNativeEvent(_event: GHEvent): any {
    return {
      rotation: this.rotation ? this.rotation : 0,
      anchorX: this.getAnchorX(),
      anchorY: this.getAnchorY(),
      velocity: this.velocity ? this.velocity : 0,
    };
  }

  public get name(): string {
    return 'rotation';
  }

  public getAnchorX(): number {
    const anchorX = this.rotationGestureDetector.getAnchorX();

    return anchorX ? anchorX : this.cachedAnchorX;
  }

  public getAnchorY(): number {
    const anchorY = this.rotationGestureDetector.getAnchorY();

    return anchorY ? anchorY : this.cachedAnchorY;
  }

  protected onDownAction(event: GHEvent): void {
    this.tracker.addToTracker(event);

    console.log(this.tracker);

    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_DOWN;
      this.checkUndetermined(event);
      this.rotationGestureDetector.onTouchEvent(event, this.tracker);
    }
  }

  protected onMoveAction(event: GHEvent): void {
    if (this.tracker.getTrackedPointersNumber() < 2) return;
    if (!this.rotationGestureDetector) return;

    if (this.getAnchorX()) this.cachedAnchorX = this.getAnchorX();
    if (this.getAnchorY()) this.cachedAnchorY = this.getAnchorY();

    this.tracker.track(event);

    this.rotationGestureDetector.onTouchEvent(event, this.tracker);

    super.onMoveAction(event);
  }

  protected onOutOfBoundsAction(_event: GHEvent): void {
    //
  }

  protected onUpAction(event: GHEvent): void {
    if (!this.rotationGestureDetector) {
      this.tracker.resetTracker();
      return;
    }

    if (this.tracker.getTrackedPointersNumber() > 1) {
      event.eventType = EventTypes.POINTER_UP;
      this.rotationGestureDetector.onTouchEvent(event, this.tracker);
      this.tracker.removeFromTracker(event.pointerId);
    } else {
      this.tracker.removeFromTracker(event.pointerId);
      this.rotationGestureDetector.onTouchEvent(event, this.tracker);
      if (this.getState() !== State.ACTIVE) return;
    }

    if (event.eventType !== EventTypes.UP) return;

    if (this.getState() === State.ACTIVE) this.end(event);
    else this.fail(event);
  }

  protected onCancelAction(event: GHEvent): void {
    this.end(event);
    this.reset();
  }

  protected checkUndetermined(event: GHEvent): void {
    if (this.getState() !== State.UNDETERMINED) return;

    this.resetProgress();
    // if (!this.rotationGestureDetector) {
    //   this.rotationGestureDetector = new RotationGestureDetector(
    //     this.rotationGestureListener
    //   );
    // }

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
    if (this.getState() === State.ACTIVE) return;

    this.rotation = 0;
    this.velocity = 0;
  }
}
