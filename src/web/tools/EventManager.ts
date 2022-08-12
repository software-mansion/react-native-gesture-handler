/* eslint-disable @typescript-eslint/no-empty-function */

import { EventTypes, AdaptedPointerEvent, MouseButtons } from '../interfaces';

export default class EventManager {
  private activePointers: number[] = [];
  private readonly view: HTMLElement;

  constructor(view: HTMLElement) {
    this.view = view;
  }

  public setListeners() {
    this.view.addEventListener('pointerdown', (event: PointerEvent): void => {
      if (
        !this.isPointerInBounds({
          x: event.clientX,
          y: event.clientY,
        })
      ) {
        return;
      }

      const adaptedEvent: AdaptedPointerEvent = this.mapEvent(
        event,
        EventTypes.DOWN
      );
      const target = event.target as HTMLElement;

      target.setPointerCapture(adaptedEvent.pointerId);
      this.addActivePointer(adaptedEvent.pointerId);
      this.onPointerDown(adaptedEvent);
    });

    this.view.addEventListener('pointerup', (event: PointerEvent): void => {
      const adaptedEvent: AdaptedPointerEvent = this.mapEvent(
        event,
        EventTypes.UP
      );
      const target = event.target as HTMLElement;

      this.onPointerUp(adaptedEvent);
      target.releasePointerCapture(adaptedEvent.pointerId);
      this.removeActivePointer(adaptedEvent.pointerId);
    });

    this.view.addEventListener('pointermove', (event: PointerEvent): void => {
      if (
        event.pointerType === 'mouse' &&
        event.buttons !== MouseButtons.LEFT
      ) {
        return;
      }

      const adaptedEvent: AdaptedPointerEvent = this.mapEvent(
        event,
        EventTypes.MOVE
      );

      const inBounds: boolean = this.isPointerInBounds({
        x: adaptedEvent.x,
        y: adaptedEvent.y,
      });

      const pointerIndex: number = this.activePointers.indexOf(
        adaptedEvent.pointerId
      );

      if (inBounds) {
        if (pointerIndex < 0) {
          adaptedEvent.eventType = EventTypes.ENTER;
          this.onPointerEnter(adaptedEvent);
          this.addActivePointer(adaptedEvent.pointerId);
        } else {
          this.onPointerMove(adaptedEvent);
        }
      } else {
        if (pointerIndex >= 0) {
          adaptedEvent.eventType = EventTypes.OUT;
          this.onPointerOut(adaptedEvent);
          this.removeActivePointer(adaptedEvent.pointerId);
        } else {
          this.onPointerOutOfBounds(adaptedEvent);
        }
      }
    });

    this.view.addEventListener('pointercancel', (event: PointerEvent): void => {
      event.preventDefault();

      const adaptedEvent: AdaptedPointerEvent = this.mapEvent(
        event,
        EventTypes.CANCEL
      );

      this.onPointerCancel(adaptedEvent);
    });
  }

  private onPointerDown(_event: AdaptedPointerEvent): void {}
  private onPointerUp(_event: AdaptedPointerEvent): void {}
  private onPointerMove(_event: AdaptedPointerEvent): void {}
  private onPointerOut(_event: AdaptedPointerEvent): void {}
  private onPointerEnter(_event: AdaptedPointerEvent): void {}
  private onPointerCancel(_event: AdaptedPointerEvent): void {}
  private onPointerOutOfBounds(_event: AdaptedPointerEvent): void {}

  public setOnPointerDown(
    callback: (event: AdaptedPointerEvent) => void
  ): void {
    this.onPointerDown = callback;
  }
  public setOnPointerUp(callback: (event: AdaptedPointerEvent) => void): void {
    this.onPointerUp = callback;
  }
  public setOnPointerMove(
    callback: (event: AdaptedPointerEvent) => void
  ): void {
    this.onPointerMove = callback;
  }
  public setOnPointerOut(callback: (event: AdaptedPointerEvent) => void): void {
    this.onPointerOut = callback;
  }
  public setOnPointerEnter(
    callback: (event: AdaptedPointerEvent) => void
  ): void {
    this.onPointerEnter = callback;
  }
  public setOnPointerCancel(
    callback: (event: AdaptedPointerEvent) => void
  ): void {
    this.onPointerCancel = callback;
  }
  public setOnPointerOutOfBounds(
    callback: (event: AdaptedPointerEvent) => void
  ): void {
    this.onPointerOutOfBounds = callback;
  }

  private mapEvent(
    event: PointerEvent,
    eventType: EventTypes
  ): AdaptedPointerEvent {
    return {
      x: event.clientX,
      y: event.clientY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      pointerId: event.pointerId,
      eventType: eventType,
      pointerType: event.pointerType,
      buttons: event.buttons,
      time: event.timeStamp,
    };
  }

  public isPointerInBounds({ x, y }: { x: number; y: number }): boolean {
    if (!this.view) {
      return false;
    }

    const rect: DOMRect = this.view.getBoundingClientRect();

    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  private addActivePointer(pointerId: number): void {
    if (this.activePointers.indexOf(pointerId) >= 0) {
      return;
    }

    this.activePointers.push(pointerId);
  }

  private removeActivePointer(pointerId: number): void {
    const index: number = this.activePointers.indexOf(pointerId);

    if (index < 0) {
      return;
    }

    this.activePointers.splice(index, 1);
  }
}
