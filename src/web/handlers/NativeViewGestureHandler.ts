import { State } from '../../State';
import { GHEvent } from '../tools/EventManager';
import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  private buttonRole!: boolean;

  private disallowInterruption = false;

  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);

    if (!this.view) return;

    this.view.style['touchAction'] = 'auto';
    // this.view.style['webkitUserSelect'] = 'auto';
    // this.view.style['userSelect'] = 'auto';
    // this.view.style['WebkitTouchCallout'] = 'auto';

    if (this.view.hasAttribute('role')) this.buttonRole = true;
    else this.buttonRole = false;
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
      if (this.buttonRole) this.activate(event);
    }
  }

  protected onMoveAction(_event: GHEvent): void {
    //
  }

  protected onOutAction(event: GHEvent): void {
    this.cancel(event);
  }

  protected onUpAction(event: GHEvent): void {
    this.tracker.removeFromTracker(event.pointerId);
    if (!this.buttonRole) this.activate(event);
    if (this.tracker.getTrackedPointersNumber() === 0) this.end(event);
  }

  protected onCancelAction(event: GHEvent): void {
    this.reset();
    this.cancel(event);
  }

  public shouldRecognizeSimultaneously(handler: GestureHandler): boolean {
    if (super.shouldRecognizeSimultaneously(handler)) return true;

    if (
      handler instanceof NativeViewGestureHandler &&
      handler.getState() === State.ACTIVE &&
      handler.disallowsInterruption()
    ) {
      return false;
    }

    const canBeInterrupted = !this.disallowInterruption;

    if (
      this.getState() === State.ACTIVE &&
      handler.getState() === State.ACTIVE &&
      canBeInterrupted
    ) {
      return false;
    }

    return (
      this.getState() === State.ACTIVE &&
      canBeInterrupted &&
      handler.getTag() > 0
    );
  }

  public shouldBeCancelledByOther(_handler: GestureHandler): boolean {
    return !this.disallowInterruption;
  }

  public disallowsInterruption(): boolean {
    return this.disallowInterruption;
  }

  protected onCancel(): void {
    // throw new Error('Method not implemented.');/
  }
  protected onReset(): void {
    // throw new Error('Method not implemented.');
  }
}
