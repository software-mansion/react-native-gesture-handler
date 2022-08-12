/* eslint-disable @typescript-eslint/no-empty-function */
import { AdaptedEvent, EventTypes } from '../interfaces';

export default abstract class EventManager {
  protected readonly view: HTMLElement;
  protected pointersInBounds: number[] = [];
  public activePointersCounter: number;

  constructor(view: HTMLElement) {
    this.view = view;
    this.activePointersCounter = 0;
  }

  public abstract setListeners(): void;
  protected abstract mapEvent(
    event: Event,
    eventType: EventTypes,
    index?: number
  ): AdaptedEvent;

  protected onPointerDown(_event: AdaptedEvent): void {}
  protected onPointerAdd(_event: AdaptedEvent): void {}
  protected onPointerUp(_event: AdaptedEvent): void {}
  protected onPointerRemove(_event: AdaptedEvent): void {}
  protected onPointerMove(_event: AdaptedEvent): void {}
  protected onPointerOut(_event: AdaptedEvent): void {}
  protected onPointerEnter(_event: AdaptedEvent): void {}
  protected onPointerCancel(_event: AdaptedEvent): void {}
  protected onPointerOutOfBounds(_event: AdaptedEvent): void {}

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
  public setOnPointerOut(callback: (event: AdaptedEvent) => void): void {
    this.onPointerOut = callback;
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

  public isPointerInBounds({ x, y }: { x: number; y: number }): boolean {
    if (!this.view) return false;

    const rect: DOMRect = this.view.getBoundingClientRect();

    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  protected markAsInBounds(pointerId: number): void {
    if (this.pointersInBounds.indexOf(pointerId) >= 0) return;

    this.pointersInBounds.push(pointerId);
  }

  protected markAsOutOfBounds(pointerId: number): void {
    const index: number = this.pointersInBounds.indexOf(pointerId);

    if (index < 0) return;

    this.pointersInBounds.splice(index, 1);
  }
}
