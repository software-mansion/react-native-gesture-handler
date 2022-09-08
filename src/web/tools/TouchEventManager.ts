import {
  AdaptedEvent,
  EventTypes,
  MouseButtons,
  PointerType,
  TouchEventType,
} from '../interfaces';
import EventManager from './EventManager';
import { isPointerInBounds } from '../utils';

export default class TouchEventManager extends EventManager {
  public setListeners(): void {
    this.view.addEventListener('touchstart', (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.DOWN,
          i,
          TouchEventType.DOWN
        );

        // Here we skip stylus, because in case of anything different than touch we want to handle it by using PointerEvents
        // If we leave stylus to send touch events, handlers will receive every action twice
        if (
          !isPointerInBounds(this.view, {
            x: adaptedEvent.x,
            y: adaptedEvent.y,
          }) ||
          //@ts-ignore touchType field does exist
          event.changedTouches[i].touchType === 'stylus'
        ) {
          continue;
        }

        this.markAsInBounds(adaptedEvent.pointerId);

        if (++this.activePointersCounter > 1) {
          adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_DOWN;
          this.onPointerAdd(adaptedEvent);
        } else {
          this.onPointerDown(adaptedEvent);
        }
      }
    });

    this.view.addEventListener('touchmove', (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.MOVE,
          i,
          TouchEventType.MOVE
        );
        //@ts-ignore touchType field does exist
        if (event.changedTouches[i].touchType === 'stylus') {
          continue;
        }

        const inBounds: boolean = isPointerInBounds(this.view, {
          x: adaptedEvent.x,
          y: adaptedEvent.y,
        });

        const pointerIndex: number = this.pointersInBounds.indexOf(
          adaptedEvent.pointerId
        );

        if (inBounds) {
          if (pointerIndex < 0) {
            adaptedEvent.eventType = EventTypes.ENTER;
            this.onPointerEnter(adaptedEvent);
            this.markAsInBounds(adaptedEvent.pointerId);
          } else {
            this.onPointerMove(adaptedEvent);
          }
        } else {
          if (pointerIndex >= 0) {
            adaptedEvent.eventType = EventTypes.OUT;
            this.onPointerOut(adaptedEvent);
            this.markAsOutOfBounds(adaptedEvent.pointerId);
          } else {
            this.onPointerOutOfBounds(adaptedEvent);
          }
        }
      }
    });

    this.view.addEventListener('touchend', (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; ++i) {
        // When we call reset on gesture handlers, it also resets their event managers
        // In some handlers (like RotationGestureHandler) reset is called before all pointers leave view
        // This means, that activePointersCounter will be set to 0, while there are still remaining pointers on view
        // Removing them will end in activePointersCounter going below 0, therefore handlers won't behave properly
        if (this.activePointersCounter === 0) {
          break;
        }

        //@ts-ignore touchType field does exist
        if (event.changedTouches[i].touchType === 'stylus') {
          continue;
        }

        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.UP,
          i,
          TouchEventType.UP
        );

        this.markAsOutOfBounds(adaptedEvent.pointerId);

        if (--this.activePointersCounter > 0) {
          adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_UP;
          this.onPointerRemove(adaptedEvent);
        } else {
          this.onPointerUp(adaptedEvent);
        }
      }
    });

    this.view.addEventListener('touchcancel', (event: TouchEvent) => {
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.CANCEL,
          i,
          TouchEventType.CANCELLED
        );

        //@ts-ignore touchType field does exist
        if (event.changedTouches[i].touchType === 'stylus') {
          continue;
        }

        this.onPointerCancel(adaptedEvent);
        this.markAsOutOfBounds(adaptedEvent.pointerId);
        this.activePointersCounter = 0;
      }
    });
  }

  protected mapEvent(
    event: TouchEvent,
    eventType: EventTypes,
    index: number,
    touchEventType: TouchEventType
  ): AdaptedEvent {
    const rect = this.view.getBoundingClientRect();
    const clientX = event.changedTouches[index].clientX;
    const clientY = event.changedTouches[index].clientY;

    return {
      x: clientX,
      y: clientY,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      pointerId: event.changedTouches[index].identifier,
      eventType: eventType,
      pointerType: PointerType.TOUCH,
      buttons: MouseButtons.NONE,
      time: event.timeStamp,
      allTouches: event.touches,
      changedTouches: event.changedTouches,
      touchEventType: touchEventType,
    };
  }
}
