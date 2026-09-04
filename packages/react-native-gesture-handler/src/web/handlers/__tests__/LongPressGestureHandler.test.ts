import { ActionType } from '../../../ActionType';
import { PointerType } from '../../../PointerType';
import { State } from '../../../State';
import type { AdaptedEvent } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import type { GestureHandlerDelegate } from '../../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../../tools/GestureHandlerOrchestrator';
import type IGestureHandler from '../IGestureHandler';
import LongPressGestureHandler from '../LongPressGestureHandler';

class TestLongPressGestureHandler extends LongPressGestureHandler {
  public pointerDown(event: AdaptedEvent): void {
    this.onPointerDown(event);
  }
}

function touchEvent(pointerId: number, x: number, y: number): AdaptedEvent {
  return {
    x,
    y,
    offsetX: x,
    offsetY: y,
    pointerId,
    eventType: EventTypes.DOWN,
    pointerType: PointerType.TOUCH,
    time: 0,
  };
}

function createHandler() {
  const delegate = {
    init: jest.fn(),
    detach: jest.fn(),
    reset: jest.fn(),
    onActivate: jest.fn(),
    onFail: jest.fn(),
    onCancel: jest.fn(),
    onEnd: jest.fn(),
    onEnabledChange: jest.fn(),
    updateDOM: jest.fn(),
  } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;

  const handler = new TestLongPressGestureHandler(delegate);
  handler.init(1, { current: {} } as never, ActionType.JS_FUNCTION_OLD_API);

  // The full event pipeline is not under test, silence event emission.
  handler.sendEvent = jest.fn();

  return handler;
}

describe('LongPressGestureHandler config reset', () => {
  afterEach(() => {
    // The orchestrator is a singleton, drop handlers recorded by the test.
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('a config without numberOfPointers restores the single pointer default', () => {
    const handler = createHandler();

    handler.setGestureConfig({
      enabled: true,
      minDurationMs: 0,
      numberOfPointers: 2,
    });
    handler.setGestureConfig({ enabled: true, minDurationMs: 0 });

    handler.pointerDown(touchEvent(0, 100, 100));

    expect(handler.state).toBe(State.ACTIVE);
  });

  test('numberOfPointers still applies while it stays in the config', () => {
    const handler = createHandler();

    handler.setGestureConfig({
      enabled: true,
      minDurationMs: 0,
      numberOfPointers: 2,
    });

    handler.pointerDown(touchEvent(0, 100, 100));

    expect(handler.state).toBe(State.BEGAN);
  });
});
