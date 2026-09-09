import { PointerType } from '../../../PointerType';
import type { AdaptedEvent, Config } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import EventManager from '../../tools/EventManager';
import type { GestureHandlerDelegate } from '../../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../../tools/GestureHandlerOrchestrator';
import { GestureHandlerWebDelegate } from '../../tools/GestureHandlerWebDelegate';
import GestureHandler from '../GestureHandler';
import type IGestureHandler from '../IGestureHandler';

class TestGestureHandler extends GestureHandler {}

class TestEventManager extends EventManager<unknown> {
  public registerListeners = jest.fn();
  public unregisterListeners = jest.fn();

  protected mapEvent(): never {
    throw new Error('Test event manager does not map events');
  }
}

function createHandler(enabled: boolean) {
  const delegate = {
    onEnabledChange: jest.fn(),
  } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;
  const handler = new TestGestureHandler(delegate);

  handler.setGestureConfig({ enabled });

  return handler;
}

describe('GestureHandler web config reset', () => {
  test('a config without enabled restores the enabled default', () => {
    const handler = createHandler(false);

    handler.setGestureConfig({} as Config);

    expect(handler.enabled).toBe(true);
  });

  test('a config without touchAction refreshes the DOM', () => {
    const delegate = {
      onEnabledChange: jest.fn(),
      updateDOM: jest.fn(),
    };
    const handler = new TestGestureHandler(
      delegate as unknown as GestureHandlerDelegate<unknown, IGestureHandler>
    );
    handler.setGestureConfig({ enabled: true, touchAction: 'pan-y' });

    handler.setGestureConfig({ enabled: true });

    expect(handler.touchAction).toBeUndefined();
    expect(delegate.updateDOM).toHaveBeenCalledTimes(1);
  });

  test('the web delegate ignores DOM updates before init', () => {
    expect(() => new GestureHandlerWebDelegate().updateDOM()).not.toThrow();
  });
});

describe('GestureHandler web event manager attachment', () => {
  test('registers listeners for an initially enabled handler', () => {
    const manager = new TestEventManager({});

    createHandler(true).attachEventManager(manager);

    expect(manager.registerListeners).toHaveBeenCalledTimes(1);
  });

  test('does not register listeners for an initially disabled handler', () => {
    const manager = new TestEventManager({});

    createHandler(false).attachEventManager(manager);

    expect(manager.registerListeners).not.toHaveBeenCalled();
  });
});

describe('GestureHandlerOrchestrator idle handlers', () => {
  const delegate = {
    onEnabledChange: jest.fn(),
  } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;
  const pointerDown: AdaptedEvent = {
    x: 10,
    y: 10,
    offsetX: 10,
    offsetY: 10,
    pointerId: 1,
    eventType: EventTypes.DOWN,
    pointerType: PointerType.MOUSE,
    time: 0,
  };

  afterEach(() => {
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('a recorded handler that never began is dropped once its pointers are gone', () => {
    const stale = new TestGestureHandler(delegate);
    const next = new TestGestureHandler(delegate);
    stale.setGestureConfig({ enabled: true });
    next.setGestureConfig({ enabled: true });

    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(stale);
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(next);

    expect(GestureHandlerOrchestrator.instance.isHandlerRecorded(stale)).toBe(
      false
    );
    expect(GestureHandlerOrchestrator.instance.isHandlerRecorded(next)).toBe(
      true
    );
  });

  test('a recorded handler that still tracks a pointer is kept', () => {
    const pressed = new TestGestureHandler(delegate);
    const next = new TestGestureHandler(delegate);
    pressed.setGestureConfig({ enabled: true });
    next.setGestureConfig({ enabled: true });

    pressed.tracker.addToTracker(pointerDown);
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(pressed);
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(next);

    expect(GestureHandlerOrchestrator.instance.isHandlerRecorded(pressed)).toBe(
      true
    );
  });
});
