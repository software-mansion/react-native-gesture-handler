import { State } from '../../../State';
import type { Config } from '../../interfaces';
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
    reset: jest.fn(),
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
      reset: jest.fn(),
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

describe('GestureHandler web disable mid-gesture', () => {
  afterEach(() => {
    // The orchestrator is a singleton, drop handlers recorded by the test.
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('a handler disabled while begun is dropped from the orchestrator', () => {
    const delegate = {
      onEnabledChange: jest.fn(),
      onCancel: jest.fn(),
      reset: jest.fn(),
    } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;
    const handler = new TestGestureHandler(delegate);
    handler.setGestureConfig({ enabled: true });
    // The full event pipeline is not under test, silence event emission.
    handler.sendEvent = jest.fn();

    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(handler);
    handler.begin();
    expect(handler.state).toBe(State.BEGAN);

    handler.setGestureConfig({ enabled: false });

    expect(handler.state).toBe(State.UNDETERMINED);
    expect(GestureHandlerOrchestrator.instance.isHandlerRecorded(handler)).toBe(
      false
    );
  });
});
