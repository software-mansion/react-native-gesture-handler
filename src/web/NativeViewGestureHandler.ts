import { GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  public init(ref: number, propsRef: any): void {
    super.init(ref, propsRef);

    this.setShouldCancelWhenOutside(true);
    this.view.style['touchAction'] = 'auto';
    this.view.style['webkitUserSelect'] = 'auto';
    this.view.style['userSelect'] = 'auto';
    this.view.style['WebkitTouchCallout'] = 'auto';
  }

  protected resetConfig(): void {
    super.resetConfig();

    this.shouldActivateOnStart = false;
    this.disallowInterruption = false;
  }

  get name(): string {
    return 'native';
  }

  protected onDownAction(event: GHEvent): void {
    console.log(this.getState());
    this.begin(event);
    console.log(this.getState());
  }

  protected onMoveAction(event: GHEvent): void {}

  protected onUpAction(event: GHEvent): void {
    console.log(this.getState());
    this.end(event);
    console.log(this.getState());
  }

  protected onCancel(): void {
    // throw new Error('Method not implemented.');/
  }
  protected onReset(): void {
    // throw new Error('Method not implemented.');
  }
}
