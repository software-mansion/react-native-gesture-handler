import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';
import { View } from 'react-native';

export default class KeyEventManager extends EventManager<HTMLElement> {
  private activationKeys = ['Enter', 'Space'];
  private cancelationKeys = ['Tab'];

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (this.cancelationKeys.indexOf(event.code) !== -1) {
      (event.target as unknown as View)?.measure?.(
        (_x, _y, w, h, pageX, pageY) => {
          this.onPointerCancel(
            this.adaptEvent(event, EventTypes.DOWN, pageX, pageY, w, h)
          );
        }
      );
    }

    if (this.activationKeys.indexOf(event.code) === -1) {
      return;
    }

    (event.target as unknown as View)?.measure?.(
      (_x, _y, w, h, pageX, pageY) => {
        this.onPointerDown(
          this.adaptEvent(event, EventTypes.DOWN, pageX, pageY, w, h)
        );
      }
    );
  };

  private keyUpCallback = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.code) === -1) {
      return;
    }

    (event.target as unknown as View)?.measure?.(
      (_x, _y, w, h, pageX, pageY) => {
        this.onPointerUp(
          this.adaptEvent(event, EventTypes.UP, pageX, pageY, w, h)
        );
      }
    );
  };

  public registerListeners(): void {
    this.view.addEventListener('keydown', this.keyDownCallback);
    this.view.addEventListener('keyup', this.keyUpCallback);
  }

  public unregisterListeners(): void {
    this.view.addEventListener('keydown', this.keyDownCallback);
    this.view.addEventListener('keyup', this.keyUpCallback);
  }

  private adaptEvent(
    event: KeyboardEvent,
    eventType: EventTypes,
    pageX: number,
    pageY: number,
    elementWidth: number,
    elementHeight: number
  ): AdaptedEvent {
    return {
      x: pageX + elementWidth / 2,
      y: pageY + elementHeight / 2,
      offsetX: pageX + elementWidth / 2,
      offsetY: pageY + elementHeight / 2,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: event.timeStamp,
    };
  }

  protected mapEvent(
    event: KeyboardEvent,
    eventType: EventTypes
  ): AdaptedEvent {
    // unused and disfunctional but has to be present
    return {
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: event.timeStamp,
    };
  }
}
