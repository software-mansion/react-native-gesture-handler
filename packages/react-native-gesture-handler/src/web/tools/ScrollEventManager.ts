import { PointerType } from '../../PointerType';
import type { AdaptedEvent } from '../interfaces';
import { EventTypes } from '../interfaces';
import EventManager from './EventManager';

export default class ScrollEventManager extends EventManager<HTMLElement> {
  private scrollCallback = (event: Event) => {
    this.onScroll(this.mapEvent(event));
  };

  public registerListeners(): void {
    this.view.addEventListener('scroll', this.scrollCallback, {
      passive: true,
    });
  }

  public unregisterListeners(): void {
    this.view.removeEventListener('scroll', this.scrollCallback);
  }

  protected mapEvent(event: Event): AdaptedEvent {
    // Synthesize a pointer glued to the scrolled content - deltas between
    // events equal the scrolled distance. getBoundingClientRect would only
    // add a constant offset at the cost of a layout read on every event.
    return {
      x: -this.view.scrollLeft,
      y: -this.view.scrollTop,
      offsetX: -this.view.scrollLeft,
      offsetY: -this.view.scrollTop,
      pointerId: -1,
      eventType: EventTypes.MOVE,
      pointerType: PointerType.OTHER,
      time: event.timeStamp,
    };
  }
}
