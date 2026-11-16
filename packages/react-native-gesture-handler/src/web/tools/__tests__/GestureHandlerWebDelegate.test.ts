import { ActionType } from '../../../ActionType';
import { MouseButton } from '../../../handlers/gestureHandlerCommon';
import type GestureHandler from '../../handlers/GestureHandler';
import type IGestureHandler from '../../handlers/IGestureHandler';
import LongPressGestureHandler from '../../handlers/LongPressGestureHandler';
import PanGestureHandler from '../../handlers/PanGestureHandler';
import GestureHandlerOrchestrator from '../GestureHandlerOrchestrator';
import { GestureHandlerWebDelegate } from '../GestureHandlerWebDelegate';

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
  return Object.assign(new EventTarget(), { style: {} });
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
