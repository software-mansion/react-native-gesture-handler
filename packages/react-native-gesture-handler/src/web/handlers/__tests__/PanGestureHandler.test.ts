import { ActionType } from '../../../ActionType';
import { PointerType } from '../../../PointerType';
import { State } from '../../../State';
import type { AdaptedEvent } from '../../interfaces';
import { EventTypes } from '../../interfaces';
import type EventManager from '../../tools/EventManager';
import type { GestureHandlerDelegate } from '../../tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../../tools/GestureHandlerOrchestrator';
import WheelEventManager from '../../tools/WheelEventManager';
import type IGestureHandler from '../IGestureHandler';
import PanGestureHandler from '../PanGestureHandler';

class TestPanGestureHandler extends PanGestureHandler {
  public readonly wheelEvents: AdaptedEvent[] = [];

  public wheel(event: AdaptedEvent): void {
    this.onWheel(event);
  }

  public nativeEvent() {
    return this.transformNativeEvent();
  }

  protected override onWheel(event: AdaptedEvent): void {
    this.wheelEvents.push(event);
    super.onWheel(event);
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

function createHandler(eventManagers: EventManager<unknown>[] = []) {
  const delegate = {
    init: jest.fn(),
    detach: jest.fn(),
    // Mirrors GestureHandlerWebDelegate.reset(), which forwards the reset to
    // every event manager attached to the handler.
    reset: jest.fn(() =>
      eventManagers.forEach((manager) => manager.resetManager())
    ),
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

afterEach(() => {
  // The orchestrator is a singleton, drop handlers recorded by the test.
  (
    GestureHandlerOrchestrator.instance as unknown as {
      gestureHandlers: IGestureHandler[];
    }
  ).gestureHandlers = [];
});

// A 100x100 view scaled around its center, `left` and `top` are the bounds of
// the scaled box.
class FakeView {
  public readonly style = {};
  public readonly children = [];
  public readonly offsetWidth = 100;
  public readonly offsetHeight = 100;
  public readonly computedStyle: Record<string, string>;
  private readonly listeners = new Map<string, Set<(event: unknown) => void>>();
  public readonly listenerOptions = new Map<string, unknown>();

  constructor(
    private readonly left = 0,
    private readonly top = 0,
    private readonly scale = 1
  ) {
    this.computedStyle = {
      display: 'block',
      scale: 'none',
      transform: `matrix(${scale}, 0, 0, ${scale}, 0, 0)`,
    };
  }

  public getBoundingClientRect() {
    const size = 100 * Math.abs(this.scale);

    return { left: this.left, top: this.top, width: size, height: size };
  }

  public addEventListener(
    type: string,
    listener: (event: unknown) => void,
    options?: unknown
  ) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
    this.listenerOptions.set(type, options);
  }

  public removeEventListener(type: string, listener: (event: unknown) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  public wheel(deltaY: number, event: Partial<WheelEvent> = {}): void {
    this.listeners.get('wheel')?.forEach((listener) =>
      listener({
        clientX: 0,
        clientY: 0,
        offsetX: 0,
        offsetY: 0,
        deltaX: 0,
        deltaY,
        timeStamp: 0,
        // Not a multiple of 120, so the wheel is recognized as a touchpad.
        wheelDeltaY: 13,
        ...event,
      })
    );
  }
}

// The Jest environment is node, the view bounds are read through
// getComputedStyle.
beforeAll(() => {
  (globalThis as Record<string, unknown>).getComputedStyle = (view: FakeView) =>
    view.computedStyle;
});

afterAll(() => {
  delete (globalThis as Record<string, unknown>).getComputedStyle;
});

describe('PanGestureHandler config reset', () => {
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

describe('PanGestureHandler trackpad gesture end', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // The gesture schedules its end on every wheel event, drop the last one.
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('the wheel listener is passive, it never blocks native scrolling', () => {
    const view = new FakeView();
    const manager = new WheelEventManager(view as unknown as HTMLElement);
    const handler = createHandler([manager]);

    handler.setGestureConfig({ enabled: true });
    handler.attachEventManager(manager);

    expect(view.listenerOptions.get('wheel')).toEqual({ passive: true });
  });

  test('the next trackpad gesture starts from the wheel event coordinates', () => {
    const view = new FakeView();
    const manager = new WheelEventManager(view as unknown as HTMLElement);
    const handler = createHandler([manager]);

    handler.setGestureConfig({
      enabled: true,
      enableTrackpadTwoFingerGesture: true,
    });
    handler.attachEventManager(manager);

    view.wheel(100);
    expect(handler.state).toBe(State.ACTIVE);

    // A trackpad gesture ends when the wheel goes quiet for 30ms.
    jest.advanceTimersByTime(30);
    expect(handler.state).toBe(State.UNDETERMINED);

    view.wheel(30);

    // A wheel does not move the cursor, so the manager synthesizes coordinates
    // by accumulating deltas. The gesture that just ended must not contribute.
    expect(handler.wheelEvents[1].y).toBe(30);
  });
});

describe('PanGestureHandler trackpad coordinates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function trackpadPan(view: FakeView, event: Partial<WheelEvent> = {}) {
    const manager = new WheelEventManager(view as unknown as HTMLElement);
    const handler = createHandler([manager]);

    handler.setGestureConfig({
      enabled: true,
      enableTrackpadTwoFingerGesture: true,
    });
    handler.attachEventManager(manager);

    view.wheel(10, { deltaX: 5, ...event });
    view.wheel(10, { deltaX: 5, ...event });
    view.wheel(10, { deltaX: 5, ...event });

    return handler.nativeEvent();
  }

  test('a view at the page origin', () => {
    expect(trackpadPan(new FakeView())).toMatchObject({
      x: 15,
      y: 30,
      absoluteX: 15,
      absoluteY: 30,
    });
  });

  test('a view away from the page origin', () => {
    const view = new FakeView(40, 60);

    expect(
      trackpadPan(view, { clientX: 50, clientY: 80, offsetX: 10, offsetY: 20 })
    ).toMatchObject({ x: 25, y: 50, absoluteX: 65, absoluteY: 110 });
  });

  test('a wheel over a child of the view', () => {
    const view = new FakeView(40, 60);

    // The child sits at (70, 90), offsetX and offsetY are relative to it.
    expect(
      trackpadPan(view, { clientX: 80, clientY: 100, offsetX: 10, offsetY: 10 })
    ).toMatchObject({ x: 55, y: 70, absoluteX: 95, absoluteY: 130 });
  });

  test('a scaled view', () => {
    const view = new FakeView(40, 60, 2);

    // offsetX and offsetY are in the untransformed space of the view.
    expect(
      trackpadPan(view, { clientX: 50, clientY: 80, offsetX: 5, offsetY: 10 })
    ).toMatchObject({ x: 12.5, y: 25, absoluteX: 65, absoluteY: 110 });
  });

  test('a mirrored view', () => {
    const view = new FakeView(40, 60, -1);

    // The view's x axis runs from its right edge: 100 - (65 - 40).
    expect(
      trackpadPan(view, { clientX: 50, clientY: 80, offsetX: 5, offsetY: 10 })
    ).toMatchObject({ x: 75, y: 50, absoluteX: 65, absoluteY: 110 });
  });
});
