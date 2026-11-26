import { ActionType } from '../../../ActionType';
import { MouseButton } from '../../../handlers/gestureHandlerCommon';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule.web';
import { DEFAULT_TOUCH_ACTION, DEFAULT_USER_SELECT } from '../../constants';
import type GestureHandler from '../../handlers/GestureHandler';
import type IGestureHandler from '../../handlers/IGestureHandler';
import LongPressGestureHandler from '../../handlers/LongPressGestureHandler';
import PanGestureHandler from '../../handlers/PanGestureHandler';
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
