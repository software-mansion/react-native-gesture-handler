import { ActionType } from '../../../ActionType';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule.web';
import { DEFAULT_TOUCH_ACTION, DEFAULT_USER_SELECT } from '../../constants';
import NodeManager from '../NodeManager';

// The Jest environment is node — provide the minimal DOM surface the delegate
// and its event managers touch.
class FakeHTMLElement {
  public style: Record<string, string> = {};
  public children: HTMLElement[] = [];
  public getAttribute(): null {
    return null;
  }
  public addEventListener = jest.fn();
  public removeEventListener = jest.fn();
}

const noopTarget = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

beforeAll(() => {
  const globals = globalThis as Record<string, unknown>;
  globals.HTMLElement = FakeHTMLElement;
  globals.SVGElement = FakeHTMLElement;
  globals.getComputedStyle = () => ({ display: '' });
  globals.document = noopTarget;
  globals.window = { document: noopTarget };
});

afterAll(() => {
  const globals = globalThis as Record<string, unknown>;
  delete globals.HTMLElement;
  delete globals.SVGElement;
  delete globals.getComputedStyle;
  delete globals.document;
  delete globals.window;
});

const TAGS = [9101, 9102];

afterEach(() => {
  TAGS.forEach((tag) => NodeManager.dropGestureHandler(tag));
});

// Attaches a handler straight to the element, the way a native detector does.
function attach(tag: number, view: FakeHTMLElement, touchAction: string) {
  RNGestureHandlerModule.createGestureHandler('TapGestureHandler', tag, {
    enabled: true,
  });
  NodeManager.getHandler(tag).init(
    view as unknown as number,
    { current: {} } as never,
    ActionType.NATIVE_DETECTOR
  );
  RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
    touchAction: touchAction as never,
    userSelect: 'none',
  });
}

describe('GestureHandlerWebDelegate styles on a shared element', () => {
  test('disabling one handler keeps the styles of the enabled one', () => {
    const view = new FakeHTMLElement();
    attach(TAGS[0], view, 'pan-x');
    attach(TAGS[1], view, 'pan-x');

    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[1], {
      enabled: false,
    });

    expect(view.style.touchAction).toBe('pan-x');
    expect(view.style.userSelect).toBe(DEFAULT_USER_SELECT);
  });

  test('a disabled handler attached later does not clear the styles', () => {
    const view = new FakeHTMLElement();
    attach(TAGS[0], view, 'pan-x');
    RNGestureHandlerModule.createGestureHandler('PanGestureHandler', TAGS[1], {
      enabled: false,
    });
    NodeManager.getHandler(TAGS[1]).init(
      view as unknown as number,
      { current: {} } as never,
      ActionType.NATIVE_DETECTOR
    );

    expect(view.style.touchAction).toBe('pan-x');
  });

  test('detaching one handler keeps the styles of the enabled one', () => {
    const view = new FakeHTMLElement();
    attach(TAGS[0], view, 'pan-x');
    attach(TAGS[1], view, 'pan-x');

    NodeManager.dropGestureHandler(TAGS[1]);

    expect(view.style.touchAction).toBe('pan-x');
  });

  test('the last enabled handler still restores the element defaults', () => {
    const view = new FakeHTMLElement();
    view.style.touchAction = 'auto';
    attach(TAGS[0], view, DEFAULT_TOUCH_ACTION);
    attach(TAGS[1], view, DEFAULT_TOUCH_ACTION);
    expect(view.style.touchAction).toBe(DEFAULT_TOUCH_ACTION);

    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[1], {
      enabled: false,
    });
    expect(view.style.touchAction).toBe(DEFAULT_TOUCH_ACTION);

    RNGestureHandlerModule.updateGestureHandlerConfig(TAGS[0], {
      enabled: false,
    });
    expect(view.style.touchAction).toBe('auto');
  });
});
