import { PointerType } from '../../../PointerType';
import type { AdaptedEvent } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import PointerTracker from '../PointerTracker';

function moveEvent(pointerId: number, x: number, time: number): AdaptedEvent {
  return {
    x,
    y: 0,
    offsetX: x,
    offsetY: 0,
    pointerId,
    eventType: EventTypes.MOVE,
    pointerType: PointerType.TOUCH,
    time,
  };
}

describe('PointerTracker velocity', () => {
  test('computes the velocity of each pointer from its own samples', () => {
    const tracker = new PointerTracker();

    tracker.addToTracker(moveEvent(1, 0, 0));
    tracker.addToTracker(moveEvent(2, 1000, 0));

    // Pointer 1 moves 10px every 16ms (625px/s), pointer 2 stays in place.
    // Their events are interleaved, as they are in a real multi-touch gesture.
    for (let i = 1; i <= 10; i++) {
      tracker.track(moveEvent(1, 10 * i, 16 * i));
      tracker.track(moveEvent(2, 1000, 16 * i + 8));
    }

    expect(tracker.getVelocity(1)?.x).toBeCloseTo(625, 0);
    expect(tracker.getVelocity(2)?.x).toBeCloseTo(0, 0);
  });

  test('uses the samples of the requested pointer in getVelocityAt', () => {
    const tracker = new PointerTracker();

    tracker.addToTracker(moveEvent(1, 0, 0));
    tracker.addToTracker(moveEvent(2, 1000, 0));

    for (let i = 1; i <= 10; i++) {
      tracker.track(moveEvent(1, 10 * i, 16 * i));
      tracker.track(moveEvent(2, 1000, 16 * i + 8));
    }

    expect(tracker.getVelocityAt(1, 168)?.x).toBeCloseTo(625, 0);
    expect(tracker.getVelocityAt(2, 168)?.x).toBeCloseTo(0, 0);
  });

  test('does not reuse the samples of a pointer that was removed', () => {
    const tracker = new PointerTracker();

    tracker.addToTracker(moveEvent(1, 0, 0));
    for (let i = 1; i <= 10; i++) {
      tracker.track(moveEvent(1, 10 * i, 16 * i));
    }
    tracker.removeFromTracker(1);

    // A new pointer shows up right away, far away from the old one. It has
    // fewer than three samples, so there is not enough data for an estimate.
    tracker.addToTracker(moveEvent(3, 500, 170));
    tracker.track(moveEvent(3, 500, 176));
    tracker.track(moveEvent(3, 500, 192));

    expect(tracker.getVelocity(3)?.x).toBeCloseTo(0, 0);
  });
});
