import { ActionType } from '../../../ActionType';
import { PointerType } from '../../../PointerType';
import { State } from '../../../State';
import type { AdaptedEvent } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import type { GestureHandlerDelegate } from '../../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../../tools/GestureHandlerOrchestrator';
import type IGestureHandler from '../IGestureHandler';
import PanGestureHandler from '../PanGestureHandler';

class TestPanGestureHandler extends PanGestureHandler {
  public wheel(event: AdaptedEvent): void {
    this.onWheel(event);
  }
}

function wheelEvent(): AdaptedEvent {
  return {
    x: 100,
    y: 100,
    offsetX: 100,
    offsetY: 100,
    pointerId: 0,
    eventType: EventTypes.MOVE,
    pointerType: PointerType.OTHER,
    time: 0,
    // Not a multiple of 120, so the wheel is recognized as a touchpad.
    wheelDeltaY: 13,
  };
}

function createHandler() {
  const delegate = {
    init: jest.fn(),
    detach: jest.fn(),
    reset: jest.fn(),
    onBegin: jest.fn(),
    onActivate: jest.fn(),
    onFail: jest.fn(),
    onCancel: jest.fn(),
    onEnd: jest.fn(),
    onEnabledChange: jest.fn(),
    updateDOM: jest.fn(),
    isPointerInBounds: jest.fn().mockReturnValue(true),
    measureView: jest.fn().mockReturnValue({
      pageX: 0,
      pageY: 0,
      width: 100,
      height: 100,
    }),
    absoluteToLocal: jest.fn((x: number, y: number) => ({ x, y })),
  } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;

  const handler = new TestPanGestureHandler(delegate);
  handler.init(1, { current: {} } as never, ActionType.JS_FUNCTION_OLD_API);

  // The full event pipeline is not under test, silence event emission.
  handler.sendEvent = jest.fn();

  return handler;
}

describe('PanGestureHandler config reset', () => {
  afterEach(() => {
    // The orchestrator is a singleton, drop handlers recorded by the test.
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('a config without enableTrackpadTwoFingerGesture restores the disabled default', () => {
    const handler = createHandler();

    handler.setGestureConfig({
      enabled: true,
      enableTrackpadTwoFingerGesture: true,
    });
    handler.setGestureConfig({ enabled: true });

    handler.wheel(wheelEvent());

    expect(handler.state).toBe(State.UNDETERMINED);
  });

  test('enableTrackpadTwoFingerGesture still applies while it stays in the config', () => {
    const handler = createHandler();

    handler.setGestureConfig({
      enabled: true,
      enableTrackpadTwoFingerGesture: true,
    });

    handler.wheel(wheelEvent());

    expect(handler.state).toBe(State.ACTIVE);
  });
});
