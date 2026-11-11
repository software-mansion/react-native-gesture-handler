import { ActionType } from '../../../ActionType';
import { PointerType } from '../../../PointerType';
import { State } from '../../../State';
import {
  DEFAULT_ENABLE_CONTEXT_MENU,
  DEFAULT_TOUCH_ACTION,
  DEFAULT_USER_SELECT,
} from '../../constants';
import type { AdaptedEvent, Config } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import EventManager from '../../tools/EventManager';
import type { GestureHandlerDelegate } from '../../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../../tools/GestureHandlerOrchestrator';
import { GestureHandlerWebDelegate } from '../../tools/GestureHandlerWebDelegate';
import GestureHandler from '../GestureHandler';
import type IGestureHandler from '../IGestureHandler';

class TestGestureHandler extends GestureHandler {
  public markAsNativeDetector() {
    this.actionType = ActionType.NATIVE_DETECTOR;
  }

  public touch(event: AdaptedEvent) {
    this.tracker.addToTracker(event);
    this.sendTouchEvent(event);
  }
}

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

  test('a full config replace keeps the detector props and refreshes the DOM', () => {
    const delegate = {
      onEnabledChange: jest.fn(),
      updateDOM: jest.fn(),
      reset: jest.fn(),
    };
    const handler = new TestGestureHandler(
      delegate as unknown as GestureHandlerDelegate<unknown, IGestureHandler>
    );
    handler.markAsNativeDetector();
    // The detector sends its props once, as a partial update.
    handler.updateGestureConfig({
      touchAction: 'pan-y',
      userSelect: 'text',
      enableContextMenu: true,
    });

    // The owner re-sends the full gesture config, which never carries them.
    handler.setGestureConfig({ enabled: true });

    expect(handler.touchAction).toBe('pan-y');
    expect(handler.userSelect).toBe('text');
    expect(handler.enableContextMenu).toBe(true);
    // The partial update also enabled the handler, so it went through
    // `onEnabledChange`; only the full replace refreshes the DOM directly.
    expect(delegate.onEnabledChange).toHaveBeenCalledTimes(1);
    expect(delegate.updateDOM).toHaveBeenCalledTimes(1);
  });

  test('the detector resets the props it set by sending the defaults', () => {
    const delegate = {
      onEnabledChange: jest.fn(),
      updateDOM: jest.fn(),
      reset: jest.fn(),
    };
    const handler = new TestGestureHandler(
      delegate as unknown as GestureHandlerDelegate<unknown, IGestureHandler>
    );
    handler.markAsNativeDetector();
    handler.setGestureConfig({ enabled: true });
    handler.updateGestureConfig({
      touchAction: 'pan-y',
      userSelect: 'text',
      enableContextMenu: true,
    });

    // The detector re-sends all three whenever one of them changes, with the
    // defaults standing in for props that are no longer set.
    handler.updateGestureConfig({
      touchAction: DEFAULT_TOUCH_ACTION,
      userSelect: DEFAULT_USER_SELECT,
      enableContextMenu: DEFAULT_ENABLE_CONTEXT_MENU,
    });

    expect(handler.touchAction).toBe('none');
    expect(handler.userSelect).toBe('none');
    expect(handler.enableContextMenu).toBeUndefined();
    // The initial full set enabled the handler (`onEnabledChange`); the two
    // partial updates refresh the DOM directly.
    expect(delegate.updateDOM).toHaveBeenCalledTimes(2);
  });

  test('enableContextMenu stays unset unless it is given', () => {
    const delegate = {
      onEnabledChange: jest.fn(),
      updateDOM: jest.fn(),
      reset: jest.fn(),
    };
    const handler = new TestGestureHandler(
      delegate as unknown as GestureHandlerDelegate<unknown, IGestureHandler>
    );
    handler.setGestureConfig({ enabled: true });

    // Unset keeps the browser's context menu, as in v2 (#4687).
    expect(handler.enableContextMenu).toBeUndefined();

    handler.setGestureConfig({ enabled: true, enableContextMenu: false });
    expect(handler.enableContextMenu).toBe(false);

    // A legacy full config replace without it goes back to unset.
    handler.setGestureConfig({ enabled: true });
    expect(handler.enableContextMenu).toBeUndefined();
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

describe('GestureHandlerOrchestrator recorded handlers passed to a new one', () => {
  // Mimics a button: refuses to begin next to any handler it was told about.
  class ExclusiveTestGestureHandler extends TestGestureHandler {
    public override shouldBeginWithRecordedHandlers(
      recorded: IGestureHandler[]
    ): boolean {
      return recorded.length === 0;
    }
  }

  const delegate = {
    onEnabledChange: jest.fn(),
    onCancel: jest.fn(),
    reset: jest.fn(),
  } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;

  const pointerDown = (pointerId: number): AdaptedEvent => ({
    x: 10,
    y: 10,
    offsetX: 10,
    offsetY: 10,
    pointerId,
    eventType: EventTypes.DOWN,
    pointerType: PointerType.TOUCH,
    time: 0,
  });

  function setup() {
    const other = new TestGestureHandler(delegate);
    const button = new ExclusiveTestGestureHandler(delegate);
    other.setGestureConfig({ enabled: true });
    button.setGestureConfig({ enabled: true });
    other.sendEvent = jest.fn();
    button.sendEvent = jest.fn();
    const cancel = jest.spyOn(button, 'cancel');

    return { other, button, cancel };
  }

  afterEach(() => {
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('a handler left in BEGAN with no pointers does not block a new one', () => {
    const { other, button, cancel } = setup();

    other.tracker.addToTracker(pointerDown(1));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(other, 1);
    other.begin();
    other.tracker.removeFromTracker(1);

    button.tracker.addToTracker(pointerDown(1));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(button, 1);

    expect(cancel).not.toHaveBeenCalled();
  });

  test('a handler tracking another pointer does not block a new one', () => {
    const { other, button, cancel } = setup();

    other.tracker.addToTracker(pointerDown(1));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(other, 1);

    button.tracker.addToTracker(pointerDown(2));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(button, 2);

    expect(cancel).not.toHaveBeenCalled();
  });

  test('a handler tracking the same pointer is passed to the new one', () => {
    const { other, button, cancel } = setup();

    other.tracker.addToTracker(pointerDown(1));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(other, 1);

    button.tracker.addToTracker(pointerDown(1));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(button, 1);

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  test('recording without a pointer passes no handlers', () => {
    const { other, button, cancel } = setup();

    other.tracker.addToTracker(pointerDown(1));
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(other, 1);

    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(button);

    expect(cancel).not.toHaveBeenCalled();
  });
});

describe('GestureHandler web touch events', () => {
  afterEach(() => {
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('touches carry the view relative coordinates of the pointer', () => {
    const delegate = {
      init: jest.fn(),
      onEnabledChange: jest.fn(),
      reset: jest.fn(),
    } as unknown as GestureHandlerDelegate<unknown, IGestureHandler>;
    const onGestureHandlerEvent = jest.fn();
    const handler = new TestGestureHandler(delegate);

    handler.init(
      1,
      { current: { onGestureHandlerEvent } } as never,
      ActionType.JS_FUNCTION_OLD_API
    );
    // The web config type only spells out the default, the runtime reads it.
    handler.setGestureConfig({
      enabled: true,
      needsPointerData: true,
    } as unknown as Config);

    // The event managers map the pointer into the view's own space, the
    // touch payload must not undo that with the view's bounds.
    handler.touch({
      x: 150,
      y: 110,
      offsetX: 25,
      offsetY: 5,
      pointerId: 0,
      eventType: EventTypes.DOWN,
      pointerType: PointerType.TOUCH,
      time: 0,
    });

    const touch = { id: 0, x: 25, y: 5, absoluteX: 150, absoluteY: 110 };

    expect(onGestureHandlerEvent).toHaveBeenCalledTimes(1);
    expect(onGestureHandlerEvent.mock.calls[0][0].nativeEvent).toMatchObject({
      allTouches: [touch],
      changedTouches: [touch],
    });
  });
});
