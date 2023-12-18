/* eslint-disable @typescript-eslint/no-empty-function */
import { AdaptedEvent, EventTypes, TouchEventType } from '../interfaces';

export default abstract class EventManager<T> {
  protected readonly view: T;
  protected pointersInBounds: number[] = [];
  protected activePointersCounter: number;

  constructor(view: T) {
    this.view = view;
    this.activePointersCounter = 0;
  }

  public abstract setListeners(): void;
  protected abstract mapEvent(
    event: Event,
    eventType: EventTypes,
    index?: number,
    touchEventType?: TouchEventType
  ): AdaptedEvent;

  protected onPointerDown(_event: AdaptedEvent): void {}
  protected onPointerAdd(_event: AdaptedEvent): void {}
  protected onPointerUp(_event: AdaptedEvent): void {}
  protected onPointerRemove(_event: AdaptedEvent): void {}
  protected onPointerMove(_event: AdaptedEvent): void {}
  protected onPointerLeave(_event: AdaptedEvent): void {} // called only when pointer is pressed (or touching)
  protected onPointerEnter(_event: AdaptedEvent): void {} // called only when pointer is pressed (or touching)
  protected onPointerCancel(_event: AdaptedEvent): void {
    // When pointer cancel is triggered and there are more pointers on the view, only one pointer is cancelled
    // Because we want all pointers to be cancelled by that event, we are doing it manually by reseting handler and changing activePointersCounter to 0
    // Events that correspond to removing the pointer (pointerup, touchend) have condition, that they don't perform any action when activePointersCounter
    // is equal to 0. This prevents counter from going to negative values, when pointers are removed from view after one of them has been cancelled
  }
  protected onPointerOutOfBounds(_event: AdaptedEvent): void {}
  protected onPointerMoveOver(_event: AdaptedEvent): void {}
  protected onPointerMoveOut(_event: AdaptedEvent): void {}

  public setOnPointerDown(callback: (event: AdaptedEvent) => void): void {
    this.onPointerDown = callback;
  }
  public setOnPointerAdd(callback: (event: AdaptedEvent) => void): void {
    this.onPointerAdd = callback;
  }
  public setOnPointerUp(callback: (event: AdaptedEvent) => void): void {
    this.onPointerUp = callback;
  }
  public setOnPointerRemove(callback: (event: AdaptedEvent) => void): void {
    this.onPointerRemove = callback;
  }
  public setOnPointerMove(callback: (event: AdaptedEvent) => void): void {
    this.onPointerMove = callback;
  }
  public setOnPointerLeave(callback: (event: AdaptedEvent) => void): void {
    this.onPointerLeave = callback;
  }
  public setOnPointerEnter(callback: (event: AdaptedEvent) => void): void {
    this.onPointerEnter = callback;
  }
  public setOnPointerCancel(callback: (event: AdaptedEvent) => void): void {
    this.onPointerCancel = callback;
  }
  public setOnPointerOutOfBounds(
    callback: (event: AdaptedEvent) => void
  ): void {
    this.onPointerOutOfBounds = callback;
  }
  public setOnPointerMoveOver(callback: (event: AdaptedEvent) => void): void {
    this.onPointerMoveOver = callback;
  }
  public setOnPointerMoveOut(callback: (event: AdaptedEvent) => void): void {
    this.onPointerMoveOut = callback;
  }

  protected markAsInBounds(pointerId: number): void {
    if (this.pointersInBounds.indexOf(pointerId) >= 0) {
      return;
    }

    this.pointersInBounds.push(pointerId);
  }

  protected markAsOutOfBounds(pointerId: number): void {
    const index: number = this.pointersInBounds.indexOf(pointerId);

    if (index < 0) {
      return;
    }

    this.pointersInBounds.splice(index, 1);
  }

  public resetManager(): void {
    // Reseting activePointersCounter is necessary to make gestures such as pinch work properly
    // There are gestures that end when there is still one active pointer (like pinch/rotation)
    // When these gestures end, they are reset, but they still receive events from pointer that is active
    // This causes trouble, since only onPointerDown registers gesture in orchestrator, and while gestures receive
    // Events from active pointer after they finished, next pointerdown event will be registered as additional pointer, not the first one
    // This casues trouble like gestures getting stuck in END state, even though they should have gone to UNDETERMINED

    this.activePointersCounter = 0;
    this.pointersInBounds = [];
  }
}
