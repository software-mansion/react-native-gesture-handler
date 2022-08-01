import GestureHandler from './GestureHandler';

export default class NativeViewGestureHandler extends GestureHandler {
  public init(ref: number, propsRef: any): void {}

  get name(): string {
    throw new Error('Method not implemented.');
  }
  protected onCancel(): void {
    throw new Error('Method not implemented.');
  }
  protected onReset(): void {
    throw new Error('Method not implemented.');
  }
}
