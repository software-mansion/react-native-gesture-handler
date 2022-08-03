/* eslint-disable @typescript-eslint/no-empty-function */
export interface GHEvent {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  eventType: EventTypes;
  pointerType: string;
  buttons: number;
  time: number;
}

enum Buttons {
  NONE,
  LEFT,
  RIGHT,
  LEFT_RIGHT,
  SCROLL,
  SCROLL_LEFT,
  SCROLL_RIGHT,
  SCROLL_LEFT_RIGHT,
}

export enum EventTypes {
  DOWN,
  POINTER_DOWN,
  UP,
  POINTER_UP,
  MOVE,
  ENTER,
  OUT,
  CANCEL,
}

class EventManager {
  private activePointers: number[] = [];
  private readonly view: HTMLElement;

  constructor(view: HTMLElement) {
    this.view = view;
  }

  //

  setListeners() {
    // this.view.oncontextmenu = () => false;
    //
    // console.log(this.view);
    this.view.addEventListener('pointerdown', (event: PointerEvent): void => {
      // event.preventDefault();

      const ghEvent: GHEvent = this.mapEvent(event, EventTypes.DOWN);
      const target = event.target as HTMLElement;

      target.setPointerCapture(ghEvent.pointerId);
      this.addActivePointer(ghEvent.pointerId);
      this.onDownAction(ghEvent);
    });

    this.view.addEventListener('pointerup', (event: PointerEvent): void => {
      // event.preventDefault();
      const ghEvent: GHEvent = this.mapEvent(event, EventTypes.UP);
      const target = event.target as HTMLElement;

      this.onUpAction(ghEvent);

      target.releasePointerCapture(ghEvent.pointerId);
      this.removeActivePointer(ghEvent.pointerId);
    });

    this.view.addEventListener('pointermove', (event: PointerEvent): void => {
      event.preventDefault();

      const ghEvent: GHEvent = this.mapEvent(event, EventTypes.MOVE);

      if (ghEvent.pointerType === 'mouse' && ghEvent.buttons !== Buttons.LEFT)
        return;

      // console.log('moveeee');

      const inBounds: boolean = this.isPointerInBounds({
        x: ghEvent.x,
        y: ghEvent.y,
      });
      const pointerIndex: number = this.activePointers.indexOf(
        ghEvent.pointerId
      );

      if (inBounds && pointerIndex < 0) {
        ghEvent.eventType = EventTypes.ENTER;
        this.onEnterAction(ghEvent);
        this.addActivePointer(ghEvent.pointerId);
      } else if (!inBounds && pointerIndex >= 0) {
        ghEvent.eventType = EventTypes.OUT;
        this.onOutAction(ghEvent);
        this.removeActivePointer(ghEvent.pointerId);
      } else if (inBounds && pointerIndex >= 0) {
        this.onMoveAction(ghEvent);
      } else if (!inBounds && pointerIndex < 0) {
        this.onOutOfBoundsAction(ghEvent);
      }
    });

    this.view.addEventListener('pointercancel', (event: PointerEvent): void => {
      event.preventDefault();
      const ghEvent: GHEvent = this.mapEvent(event, EventTypes.CANCEL);

      this.onCancelAction(ghEvent);
    });
  }

  private onDownAction(_event: GHEvent): void {}
  private onUpAction(_event: GHEvent): void {}
  private onMoveAction(_event: GHEvent): void {}
  private onOutAction(_event: GHEvent): void {}
  private onEnterAction(_event: GHEvent): void {}
  private onCancelAction(_event: GHEvent): void {}
  private onOutOfBoundsAction(_event: GHEvent): void {}

  public setOnDownAction(callback: (event: GHEvent) => void): void {
    this.onDownAction = callback;
  }
  public setOnUpAction(callback: (event: GHEvent) => void): void {
    this.onUpAction = callback;
  }
  public setOnMoveAction(callback: (event: GHEvent) => void): void {
    this.onMoveAction = callback;
  }
  public setOnOutAction(callback: (event: GHEvent) => void): void {
    this.onOutAction = callback;
  }
  public setOnEnterAction(callback: (event: GHEvent) => void): void {
    this.onEnterAction = callback;
  }
  public setOnCancelAction(callback: (event: GHEvent) => void): void {
    this.onCancelAction = callback;
  }
  public setOutOfBoundsAction(callback: (event: GHEvent) => void): void {
    this.onOutOfBoundsAction = callback;
  }

  private mapEvent(event: PointerEvent, eventType: EventTypes): GHEvent {
    return {
      x: event.clientX,
      y: event.clientY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      pointerId: event.pointerId,
      eventType: eventType,
      pointerType: event.pointerType,
      buttons: event.buttons,
      time: event.timeStamp, //Date.now()
    };
  }

  public isPointerInBounds({ x, y }: { x: number; y: number }): boolean {
    if (!this.view) return false;

    const rect: DOMRect = this.view.getBoundingClientRect();

    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  private addActivePointer(pointerId: number): void {
    // if (this.activePointers.indexOf(pointerId) >= 0) return;

    this.activePointers.push(pointerId);
  }

  private removeActivePointer(pointerId: number): void {
    const index: number = this.activePointers.indexOf(pointerId);

    // if (index < 0) return;

    this.activePointers.splice(index, 1);
  }
}

export default EventManager;
