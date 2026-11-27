import { ActionType } from '../../../ActionType';
import { MouseButton } from '../../../handlers/gestureHandlerCommon';
import { PointerType } from '../../../PointerType';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule.web';
import { DEFAULT_TOUCH_ACTION, DEFAULT_USER_SELECT } from '../../constants';
import type GestureHandler from '../../handlers/GestureHandler';
import type IGestureHandler from '../../handlers/IGestureHandler';
import LongPressGestureHandler from '../../handlers/LongPressGestureHandler';
import NativeViewGestureHandler from '../../handlers/NativeViewGestureHandler';
import PanGestureHandler from '../../handlers/PanGestureHandler';
import { EventTypes } from '../../interfaces';
import GestureHandlerOrchestrator from '../GestureHandlerOrchestrator';
import { GestureHandlerWebDelegate } from '../GestureHandlerWebDelegate';
import NodeManager from '../NodeManager';

// The test environment has no DOM. An EventTarget with a style object is
// enough for the delegate and its event managers, plus the two globals they
// read.
beforeAll(() => {
  Object.assign(globalThis, {
    document: new EventTarget(),
    getComputedStyle: () => ({ display: 'block' }),
  });
});

afterAll(() => {
  const globals = globalThis as Record<string, unknown>;
  delete globals.document;
  delete globals.getComputedStyle;
});

function createView() {
  return Object.assign(new EventTarget(), {
    style: {} as Record<string, string>,
  });
}

function attach(handler: GestureHandler, view: EventTarget) {
  handler.init(
    view as unknown as number,
    { current: {} } as never,
    ActionType.NATIVE_DETECTOR
  );
}

function isContextMenuBlocked(view: EventTarget) {
  const event = new Event('contextmenu', { cancelable: true });
  view.dispatchEvent(event);
  return event.defaultPrevented;
}

describe('GestureHandlerWebDelegate context menu', () => {
  afterEach(() => {
    // The orchestrator is a singleton, drop handlers recorded by the test.
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  test('a handler on a shared view does not remove another handler listener', () => {
    const view = createView();
    const longPress = new LongPressGestureHandler(
      new GestureHandlerWebDelegate()
    );
    const pan = new PanGestureHandler(new GestureHandlerWebDelegate());
    longPress.setGestureConfig({ enabled: true });
    pan.setGestureConfig({ enabled: true, mouseButton: MouseButton.RIGHT });
    attach(longPress, view);
    attach(pan, view);

    expect(isContextMenuBlocked(view)).toBe(true);

    // The pan no longer blocks the menu, the long press still does.
    pan.updateGestureConfig({ enabled: true, mouseButton: MouseButton.LEFT });

    expect(isContextMenuBlocked(view)).toBe(true);
  });

  test('removing enableContextMenu from one handler keeps the other blocking', () => {
    const view = createView();
    const longPress = new LongPressGestureHandler(
      new GestureHandlerWebDelegate()
    );
    const pan = new PanGestureHandler(new GestureHandlerWebDelegate());
    longPress.setGestureConfig({ enabled: true });
    pan.setGestureConfig({ enabled: true });
    attach(longPress, view);
    attach(pan, view);
    pan.updateGestureConfig({ enabled: true, enableContextMenu: false });

    // The detector sends `null` once the prop is removed.
    pan.updateGestureConfig({ enabled: true, enableContextMenu: null });

    expect(isContextMenuBlocked(view)).toBe(true);
  });
});

describe('GestureHandlerWebDelegate styles on a shared element', () => {
  const TAGS = [9101, 9102];

  // Handlers sharing a view find each other through the registry, so these
  // have to be created through the module.
  function attachRegistered(
    tag: number,
    view: EventTarget,
    touchAction: string
  ) {
    RNGestureHandlerModule.createGestureHandler('TapGestureHandler', tag, {
      enabled: true,
    });
    attach(NodeManager.getHandler(tag) as GestureHandler, view);
    RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
      touchAction: touchAction as never,
      userSelect: 'none',
    });
  }

  afterEach(() => {
    TAGS.forEach((tag) => NodeManager.dropGestureHandler(tag));
  });

  test('disabling one handler keeps the styles of the enabled one', () => {
    const view = createView();
    attachRegistered(TAGS[0], view, 'pan-x');
    attachRegistered(TAGS[1], view, 'pan-x');

    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[1], {
      enabled: false,
    });

    expect(view.style.touchAction).toBe('pan-x');
    expect(view.style.userSelect).toBe(DEFAULT_USER_SELECT);
  });

  test('a disabled handler attached later does not clear the styles', () => {
    const view = createView();
    attachRegistered(TAGS[0], view, 'pan-x');
    RNGestureHandlerModule.createGestureHandler('PanGestureHandler', TAGS[1], {
      enabled: false,
    });
    attach(NodeManager.getHandler(TAGS[1]) as GestureHandler, view);

    expect(view.style.touchAction).toBe('pan-x');
  });

  test('detaching one handler keeps the styles of the enabled one', () => {
    const view = createView();
    attachRegistered(TAGS[0], view, 'pan-x');
    attachRegistered(TAGS[1], view, 'pan-x');

    NodeManager.getHandler(TAGS[1]).detach();

    expect(view.style.touchAction).toBe('pan-x');
  });

  test('disabling a handler applies the styles of the enabled one', () => {
    const view = createView();
    attachRegistered(TAGS[0], view, 'pan-x');
    attachRegistered(TAGS[1], view, 'pan-y');
    expect(view.style.touchAction).toBe('pan-y');

    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[1], {
      enabled: false,
    });

    expect(view.style.touchAction).toBe('pan-x');
  });

  test('the last enabled handler restores the element defaults', () => {
    const view = createView();
    view.style.touchAction = 'auto';
    attachRegistered(TAGS[0], view, DEFAULT_TOUCH_ACTION);
    attachRegistered(TAGS[1], view, DEFAULT_TOUCH_ACTION);
    expect(view.style.touchAction).toBe(DEFAULT_TOUCH_ACTION);

    // The first handler goes first, so the second one must not restore the
    // styles it found on the element when it attached.
    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[0], {
      enabled: false,
    });
    expect(view.style.touchAction).toBe(DEFAULT_TOUCH_ACTION);

    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[1], {
      enabled: false,
    });
    expect(view.style.touchAction).toBe('auto');
  });

  test('the last detached handler restores the element defaults', () => {
    const view = createView();
    view.style.touchAction = 'auto';
    attachRegistered(TAGS[0], view, DEFAULT_TOUCH_ACTION);
    attachRegistered(TAGS[1], view, DEFAULT_TOUCH_ACTION);

    NodeManager.getHandler(TAGS[0]).detach();
    expect(view.style.touchAction).toBe(DEFAULT_TOUCH_ACTION);

    NodeManager.getHandler(TAGS[1]).detach();
    expect(view.style.touchAction).toBe('auto');
  });
});

describe('GestureHandlerWebDelegate click after activation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    (
      GestureHandlerOrchestrator.instance as unknown as {
        gestureHandlers: IGestureHandler[];
      }
    ).gestureHandlers = [];
  });

  function createHandler(
    Handler: typeof PanGestureHandler | typeof NativeViewGestureHandler,
    view: EventTarget,
    config: { cancelsJSResponder?: boolean } = {}
  ) {
    const handler = new Handler(new GestureHandlerWebDelegate());
    handler.setGestureConfig({ enabled: true, ...config });
    attach(handler, view);
    return handler;
  }

  // Activates the handler the way a drag does, with the pointer still down.
  function activateWithPointerDown(handler: GestureHandler) {
    handler.tracker.addToTracker({
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      pointerId: 1,
      eventType: EventTypes.DOWN,
      pointerType: PointerType.MOUSE,
      time: 0,
    });
    handler.delegate.onActivate();
  }

  function release(handler: GestureHandler) {
    handler.tracker.removeFromTracker(1);
    document.dispatchEvent(new Event('pointerup'));
  }

  function isClickStopped(view: EventTarget) {
    const event = new Event('click', { cancelable: true });
    view.dispatchEvent(event);
    return event.defaultPrevented;
  }

  test('stops the click that ends the pointer sequence', () => {
    const view = createView();
    const pan = createHandler(PanGestureHandler, view);

    activateWithPointerDown(pan);
    release(pan);

    expect(isClickStopped(view)).toBe(true);
    expect(isClickStopped(view)).toBe(false);
  });

  test('lets the next click through when the release sends no click', () => {
    const view = createView();
    const pan = createHandler(PanGestureHandler, view);

    activateWithPointerDown(pan);
    release(pan);
    jest.runAllTimers();

    expect(isClickStopped(view)).toBe(false);
  });

  test('lets the click of a new press through', () => {
    const view = createView();
    const pan = createHandler(PanGestureHandler, view);

    // For example a pan driven by the wheel, active while no button is down.
    activateWithPointerDown(pan);
    document.dispatchEvent(new Event('pointerdown'));

    expect(isClickStopped(view)).toBe(false);
  });

  test('does not stop the click when cancelsJSResponder is false', () => {
    const view = createView();
    const pan = createHandler(PanGestureHandler, view, {
      cancelsJSResponder: false,
    });

    activateWithPointerDown(pan);
    release(pan);

    expect(isClickStopped(view)).toBe(false);
  });

  test('does not stop the click of a handler activated on release', () => {
    const view = createView();
    const pan = createHandler(PanGestureHandler, view);

    pan.delegate.onActivate();

    expect(isClickStopped(view)).toBe(false);
  });

  test('does not stop the click of a native handler', () => {
    const view = createView();
    const native = createHandler(NativeViewGestureHandler, view);

    activateWithPointerDown(native);
    release(native);

    expect(isClickStopped(view)).toBe(false);
  });

  test('detaching the handler removes the click listener', () => {
    const view = createView();
    const pan = createHandler(PanGestureHandler, view);

    activateWithPointerDown(pan);
    pan.detach();

    expect(isClickStopped(view)).toBe(false);
  });
});
