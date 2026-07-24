import EventManager from '../tools/EventManager';
import type { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import GestureHandler from './GestureHandler';
import type IGestureHandler from './IGestureHandler';

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
