import { State } from '../State';
import { GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);

    // this.view.style['touchAction'] = 'auto';
    // this.view.style['webkitUserSelect'] = 'auto';
    // this.view.style['userSelect'] = 'auto';
    // this.view.style['WebkitTouchCallout'] = 'auto';
    console.log(this.view);
  }

  protected resetConfig(): void {
    super.resetConfig();
  }

  get name(): string {
    return 'native';
  }

  protected onDownAction(event: GHEvent): void {
    super.onDownAction(event);
    this.tracker.addToTracker(event);

    if (this.getState() === State.UNDETERMINED) {
      this.begin(event);
      this.activate(event);
    }
  }

  protected onMoveAction(event: GHEvent): void {
    //
  }

  protected onOutAction(event: GHEvent): void {
    this.cancel(event);
  }

  protected onUpAction(event: GHEvent): void {
    this.tracker.removeFromTracker(event.pointerId);

    console.log(this.tracker.getTrackedPointersNumber());

    if (this.tracker.getTrackedPointersNumber() === 0) this.end(event);
  }

  protected onCancelAction(event: GHEvent): void {
    this.reset();
    this.cancel(event);
  }

  protected onCancel(): void {
    // throw new Error('Method not implemented.');/
  }
  protected onReset(): void {
    // throw new Error('Method not implemented.');
  }
}
