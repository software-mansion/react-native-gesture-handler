import { ActionType } from '../ActionType';
import { PointerType } from '../PointerType';
import { State } from '../State';
import { NATIVE_GESTURE_ROLE_ATTRIBUTE } from '../web/constants';
import type IGestureHandler from '../web/handlers/IGestureHandler';
import NativeViewGestureHandler from '../web/handlers/NativeViewGestureHandler';
import type { AdaptedEvent } from '../web/interfaces';
import { EventTypes, NativeGestureRole } from '../web/interfaces';
import type { GestureHandlerDelegate } from '../web/tools/GestureHandlerDelegate';
import GestureHandlerOrchestrator from '../web/tools/GestureHandlerOrchestrator';
import ScrollEventManager from '../web/tools/ScrollEventManager';

// The Jest environment is node — provide the minimal DOM surface the handler
// touches (canUseDOM, instanceof HTMLElement).
class FakeHTMLElement {
  public style: Record<string, string> = {};
  public scrollLeft = 0;
  public scrollTop = 0;
  private attributes = new Map<string, string>();
  private listeners = new Map<string, Set<(event: unknown) => void>>();

  public setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }
  public getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }
  public hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }
  public addEventListener(type: string, listener: (event: unknown) => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }
  public removeEventListener(type: string, listener: (event: unknown) => void) {
    this.listeners.get(type)?.delete(listener);
  }
  public dispatchEvent(type: string): void {
    this.listeners.get(type)?.forEach((listener) => listener({ type }));
  }
}

beforeAll(() => {
  const globals = globalThis as Record<string, unknown>;
  globals.HTMLElement = FakeHTMLElement;
  globals.SVGElement = FakeHTMLElement;
  globals.window = { document: { createElement: () => new FakeHTMLElement() } };
});

afterAll(() => {
  const globals = globalThis as Record<string, unknown>;
  delete globals.HTMLElement;
  delete globals.SVGElement;
  delete globals.window;
});

class TestNativeViewGestureHandler extends NativeViewGestureHandler {
  public pointerDown(event: AdaptedEvent): void {
    this.onPointerDown(event);
  }

  public pointerMove(event: AdaptedEvent): void {
    this.onPointerMove(event);
  }
}

function touchEvent(x: number, y: number, eventType: EventTypes): AdaptedEvent {
  return {
    x,
    y,
    offsetX: x,
    offsetY: y,
    pointerId: 0,
    eventType,
    pointerType: PointerType.TOUCH,
    time: 0,
  };
}

function createHandler(view: FakeHTMLElement) {
  const delegate = {
    view,
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

  const handler = new TestNativeViewGestureHandler(delegate);
  handler.setGestureConfig({ enabled: true });
  handler.init(1, { current: {} } as never, ActionType.NATIVE_DETECTOR);

  // Route scroll events the same way the real delegate does.
  handler.attachEventManager(
    new ScrollEventManager(view as unknown as HTMLElement)
  );

  // The full event pipeline is not under test — silence event emission.
  handler.sendEvent = jest.fn();

  return handler;
}

describe('NativeViewGestureHandler activation', () => {
  afterEach(() => {
    // The orchestrator is a singleton — drop handlers recorded by the test.
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('scrollable view does not activate on pointer distance alone', () => {
    const view = new FakeHTMLElement();
    view.setAttribute(
      NATIVE_GESTURE_ROLE_ATTRIBUTE,
      NativeGestureRole.ScrollView
    );
    const handler = createHandler(view);

    handler.pointerDown(touchEvent(100, 100, EventTypes.DOWN));
    expect(handler.state).toBe(State.BEGAN);

    handler.pointerMove(touchEvent(100, 200, EventTypes.MOVE));
    expect(handler.state).toBe(State.BEGAN);
  });

  test('scrollable view activates when it really scrolls during a drag', () => {
    const view = new FakeHTMLElement();
    view.setAttribute(
      NATIVE_GESTURE_ROLE_ATTRIBUTE,
      NativeGestureRole.ScrollView
    );
    const handler = createHandler(view);

    handler.pointerDown(touchEvent(100, 100, EventTypes.DOWN));
    handler.pointerMove(touchEvent(100, 130, EventTypes.MOVE));

    view.dispatchEvent('scroll');
    expect(handler.state).toBe(State.ACTIVE);
  });

  test('scroll under a resting pointer does not activate (momentum stop)', () => {
    const view = new FakeHTMLElement();
    view.setAttribute(
      NATIVE_GESTURE_ROLE_ATTRIBUTE,
      NativeGestureRole.ScrollView
    );
    const handler = createHandler(view);

    handler.pointerDown(touchEvent(100, 100, EventTypes.DOWN));
    view.dispatchEvent('scroll');
    expect(handler.state).toBe(State.BEGAN);

    // Once the pointer really moves, the earlier scroll counts.
    handler.pointerMove(touchEvent(100, 110, EventTypes.MOVE));
    expect(handler.state).toBe(State.ACTIVE);
  });

  test('scroll with no tracked pointers is ignored', () => {
    const view = new FakeHTMLElement();
    view.setAttribute(
      NATIVE_GESTURE_ROLE_ATTRIBUTE,
      NativeGestureRole.ScrollView
    );
    const handler = createHandler(view);

    view.dispatchEvent('scroll');
    expect(handler.state).toBe(State.UNDETERMINED);
  });

  test('non-scrollable view keeps distance-based activation', () => {
    const view = new FakeHTMLElement();
    const handler = createHandler(view);

    handler.pointerDown(touchEvent(100, 100, EventTypes.DOWN));
    expect(handler.state).toBe(State.BEGAN);

    handler.pointerMove(touchEvent(100, 130, EventTypes.MOVE));
    expect(handler.state).toBe(State.ACTIVE);
  });

  test('role-less view keeps distance-based activation (scroll-driven mode is v3-only)', () => {
    const view = new FakeHTMLElement();
    view.style.overflowY = 'scroll';
    const handler = createHandler(view);

    handler.pointerDown(touchEvent(100, 100, EventTypes.DOWN));
    handler.pointerMove(touchEvent(100, 130, EventTypes.MOVE));
    expect(handler.state).toBe(State.ACTIVE);
  });

  test('scroll on a role-less view does not add an activation path', () => {
    const view = new FakeHTMLElement();
    view.style.overflowY = 'scroll';
    const handler = createHandler(view);

    // Below DEFAULT_TOUCH_SLOP, a scroll of the view itself must not activate
    // a handler that is not scroll-driven (e.g. legacy ScrollView, TextInput).
    handler.pointerDown(touchEvent(100, 100, EventTypes.DOWN));
    handler.pointerMove(touchEvent(100, 110, EventTypes.MOVE));
    view.dispatchEvent('scroll');
    expect(handler.state).toBe(State.BEGAN);

    handler.pointerMove(touchEvent(100, 130, EventTypes.MOVE));
    expect(handler.state).toBe(State.ACTIVE);
  });
});
