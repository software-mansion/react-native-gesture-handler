import { AdaptedEvent, EventTypes, PointerType } from '../interfaces';
import EventManager from './EventManager';
import { isPointerInBounds } from '../utils';

export default class PointerEventManager extends EventManager<HTMLElement> {
  private trackedPointers = new Set<number>();

  public setListeners(): void {
    this.view.addEventListener('pointerdown', (event: PointerEvent): void => {
      if (event.pointerType === PointerType.TOUCH) {
        return;
      }
      if (
        !isPointerInBounds(this.view, { x: event.clientX, y: event.clientY })
      ) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.DOWN);
      const target = event.target as HTMLElement;

      target.setPointerCapture(adaptedEvent.pointerId);
      this.markAsInBounds(adaptedEvent.pointerId);
      this.trackedPointers.add(adaptedEvent.pointerId);

      if (++this.activePointersCounter > 1) {
        adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_DOWN;
        this.onPointerAdd(adaptedEvent);
      } else {
        this.onPointerDown(adaptedEvent);
      }
    });

    this.view.addEventListener('pointerup', (event: PointerEvent): void => {
      if (event.pointerType === PointerType.TOUCH) {
        return;
      }

      // When we call reset on gesture handlers, it also resets their event managers
      // In some handlers (like RotationGestureHandler) reset is called before all pointers leave view
      // This means, that activePointersCounter will be set to 0, while there are still remaining pointers on view
      // Removing them will end in activePointersCounter going below 0, therefore handlers won't behave properly
      if (this.activePointersCounter === 0) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.UP);
      const target = event.target as HTMLElement;

      target.releasePointerCapture(adaptedEvent.pointerId);
      this.markAsOutOfBounds(adaptedEvent.pointerId);
      this.trackedPointers.delete(adaptedEvent.pointerId);

      if (--this.activePointersCounter > 0) {
        adaptedEvent.eventType = EventTypes.ADDITIONAL_POINTER_UP;
        this.onPointerRemove(adaptedEvent);
      } else {
        this.onPointerUp(adaptedEvent);
      }
    });

    this.view.addEventListener('pointermove', (event: PointerEvent): void => {
      if (event.pointerType === PointerType.TOUCH) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.MOVE);
      const target = event.target as HTMLElement;

      // You may be wondering why are we setting pointer capture here, when we
      // already set it in `pointerdown` handler. Well, that's a great question,
      // for which I don't have an answer. Specification (https://www.w3.org/TR/pointerevents2/#dom-element-setpointercapture)
      // says that the requirement for `setPointerCapture` to work is that pointer
      // must be in 'active buttons state`, otherwise it will fail silently, which
      // is lovely. Obviously, when `pointerdown` is fired, one of the buttons
      // (when using mouse) is pressed, but that doesn't mean that `setPointerCapture`
      // will succeed, for some reason. Since it fails silently, we don't actually know
      // if it worked or not (there's `gotpointercapture` event, but the complexity of
      // incorporating it here seems stupid), so we just call it again here, every time
      // pointer moves until it succeeds.
      // God, I do love web development.
      if (!target.hasPointerCapture(event.pointerId)) {
        target.setPointerCapture(event.pointerId);
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
          adaptedEvent.eventType = EventTypes.LEAVE;
          this.onPointerLeave(adaptedEvent);
          this.markAsOutOfBounds(adaptedEvent.pointerId);
        } else {
          this.onPointerOutOfBounds(adaptedEvent);
        }
      }
    });

    this.view.addEventListener('pointercancel', (event: PointerEvent): void => {
      if (event.pointerType === PointerType.TOUCH) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(
        event,
        EventTypes.CANCEL
      );

      this.onPointerCancel(adaptedEvent);
      this.markAsOutOfBounds(adaptedEvent.pointerId);
      this.activePointersCounter = 0;
      this.trackedPointers.clear();
    });

    // onPointerEnter and onPointerLeave are triggered by a custom logic responsible for
    // handling shouldCancelWhenOutside flag, and are unreliable unless the pointer is down.
    // We therefore use pointerenter and pointerleave events to handle the hover gesture,
    // mapping them to onPointerMoveOver and onPointerMoveOut respectively.

    this.view.addEventListener('pointerenter', (event: PointerEvent): void => {
      if (event.pointerType === PointerType.TOUCH) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.ENTER);

      this.onPointerMoveOver(adaptedEvent);
    });

    this.view.addEventListener('pointerleave', (event: PointerEvent): void => {
      if (event.pointerType === PointerType.TOUCH) {
        return;
      }

      const adaptedEvent: AdaptedEvent = this.mapEvent(event, EventTypes.LEAVE);

      this.onPointerMoveOut(adaptedEvent);
    });

    this.view.addEventListener(
      'lostpointercapture',
      (event: PointerEvent): void => {
        const adaptedEvent: AdaptedEvent = this.mapEvent(
          event,
          EventTypes.CANCEL
        );

        if (this.trackedPointers.has(adaptedEvent.pointerId)) {
          // in some cases the `pointerup` event is not fired, but `lostpointercapture` is
          // we simulate the `pointercancel` event here to make sure the gesture handler stops tracking it
          this.onPointerCancel(adaptedEvent);

          this.activePointersCounter = 0;
          this.trackedPointers.clear();
        }
      }
    );
  }

  protected mapEvent(event: PointerEvent, eventType: EventTypes): AdaptedEvent {
    return {
      x: event.clientX,
      y: event.clientY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      pointerId: event.pointerId,
      eventType: eventType,
      pointerType: event.pointerType as PointerType,
      buttons: event.buttons,
      time: event.timeStamp,
    };
  }

  public resetManager(): void {
    super.resetManager();
    this.trackedPointers.clear();
  }
}
