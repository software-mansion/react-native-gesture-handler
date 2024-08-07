import { AdaptedEvent, EventTypes } from '../interfaces';
import EventManager from './EventManager';
import { PointerType } from '../../PointerType';
import { View } from 'react-native';

export default class KeyEventManager extends EventManager<HTMLElement> {
  private activationKeys = ['Enter', 'Space'];

  private keyDownCallback = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.code) === -1) {
      return;
    }

    this.adaptEvent(event, EventTypes.DOWN).then(
      (event) => this.onPointerDown(event),
      () => null
    );
  };

  private keyUpCallback = (event: KeyboardEvent): void => {
    if (this.activationKeys.indexOf(event.code) === -1) {
      return;
    }

    this.adaptEvent(event, EventTypes.UP).then(
      (event) => this.onPointerUp(event),
      () => null
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
    eventType: EventTypes
  ): Promise<AdaptedEvent> {
    return new Promise<AdaptedEvent>((resolve, _reject) => {
      (event.target as unknown as View)?.measure(
        (_x, _y, w, h, pageX, pageY) => {
          resolve({
            x: pageX + w / 2,
            y: pageY + h / 2,
            offsetX: pageX + w / 2,
            offsetY: pageY + h / 2,
            pointerId: 0,
            eventType: eventType,
            pointerType: PointerType.KEY,
            time: event.timeStamp,
          });
        }
      );
    });
  }

  protected mapEvent(
    event: KeyboardEvent,
    eventType: EventTypes
  ): AdaptedEvent {
    const relativeX = this.view.offsetLeft + this.view.offsetWidth / 2;
    const relativeY = this.view.offsetTop + this.view.offsetHeight / 2;
    const viewportX = (event.view?.screenX ?? 0) + this.view.offsetWidth / 2;
    const viewportY = (event.view?.screenY ?? 0) + this.view.offsetHeight / 2;

    return {
      x: viewportX,
      y: viewportY,
      offsetX: relativeX,
      offsetY: relativeY,
      pointerId: 0,
      eventType: eventType,
      pointerType: PointerType.KEY,
      time: event.timeStamp,
    };
  }
}
