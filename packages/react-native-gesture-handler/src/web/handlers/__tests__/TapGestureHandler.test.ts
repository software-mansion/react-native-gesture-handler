import { ActionType } from '../../../ActionType';
import { PointerType } from '../../../PointerType';
import type { AdaptedEvent } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import type { GestureHandlerDelegate } from '../../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../../tools/GestureHandlerOrchestrator';
import type IGestureHandler from '../IGestureHandler';
import TapGestureHandler from '../TapGestureHandler';

class TestTapGestureHandler extends TapGestureHandler {
  public pointerDown(event: AdaptedEvent): void {
    this.onPointerDown(event);
  }

  public pointerUp(event: AdaptedEvent): void {
    this.onPointerUp(event);
  }
}

function touchEvent(eventType: EventTypes): AdaptedEvent {
  return {
    x: 100,
    y: 100,
    offsetX: 100,
    offsetY: 100,
    pointerId: 0,
    eventType,
    pointerType: PointerType.TOUCH,
    time: 0,
  };
}

function createHandler() {
  const onFail = jest.fn();
  const delegate = {
    init: jest.fn(),
    detach: jest.fn(),
    reset: jest.fn(),
    onActivate: jest.fn(),
    onFail,
    onCancel: jest.fn(),
    onEnd: jest.fn(),
    onEnabledChange: jest.fn(),
    updateDOM: jest.fn(),
  } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;

  const handler = new TestTapGestureHandler(delegate);
  handler.init(1, { current: {} } as never, ActionType.JS_FUNCTION_OLD_API);

  // The full event pipeline is not under test, silence event emission.
  handler.sendEvent = jest.fn();

  return { handler, onFail };
}

// Lands the first tap of a two tap gesture and lets `ms` pass without a second one.
function tapOnceAndWait(handler: TestTapGestureHandler, ms: number) {
  handler.pointerDown(touchEvent(EventTypes.DOWN));
  handler.pointerUp(touchEvent(EventTypes.UP));

  jest.advanceTimersByTime(ms);
}

describe('TapGestureHandler maxDelay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();

    // The orchestrator is a singleton, drop handlers recorded by the test.
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('defaults to 200 ms, matching Android and iOS', () => {
    const { handler, onFail } = createHandler();

    handler.setGestureConfig({ enabled: true, numberOfTaps: 2 });
    tapOnceAndWait(handler, 300);

    expect(onFail).toHaveBeenCalledTimes(1);
  });

  test('keeps waiting for the next tap within the default delay', () => {
    const { handler, onFail } = createHandler();

    handler.setGestureConfig({ enabled: true, numberOfTaps: 2 });
    tapOnceAndWait(handler, 100);

    expect(onFail).not.toHaveBeenCalled();
  });

  test('an explicit maxDelayMs overrides the default', () => {
    const { handler, onFail } = createHandler();

    handler.setGestureConfig({
      enabled: true,
      numberOfTaps: 2,
      maxDelayMs: 500,
    });
    tapOnceAndWait(handler, 300);

    expect(onFail).not.toHaveBeenCalled();
  });

  test('a config without maxDelayMs restores the default', () => {
    const { handler, onFail } = createHandler();

    handler.setGestureConfig({
      enabled: true,
      numberOfTaps: 2,
      maxDelayMs: 500,
    });
    handler.setGestureConfig({ enabled: true, numberOfTaps: 2 });
    tapOnceAndWait(handler, 300);

    expect(onFail).toHaveBeenCalledTimes(1);
  });
});
