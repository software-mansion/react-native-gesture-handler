import type { AdaptedEvent } from '../../interfaces';
import KeyboardEventManager from '../KeyboardEventManager';

// The Jest environment is node - provide the minimal DOM surface the manager
// touches (instanceof HTMLElement, getBoundingClientRect, document listeners).
class FakeHTMLElement {
  private listeners = new Map<string, Set<(event: unknown) => void>>();

  public addEventListener(type: string, listener: (event: unknown) => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  public removeEventListener(type: string, listener: (event: unknown) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  public dispatchEvent(type: string, event: unknown): void {
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }

  public getBoundingClientRect() {
    return { x: 0, y: 0, width: 10, height: 10 };
  }
}

let view: FakeHTMLElement;
let fakeDocument: FakeHTMLElement;
let managers: KeyboardEventManager[];

beforeAll(() => {
  (globalThis as Record<string, unknown>).HTMLElement = FakeHTMLElement;
});

afterAll(() => {
  delete (globalThis as Record<string, unknown>).HTMLElement;
});

beforeEach(() => {
  view = new FakeHTMLElement();
  fakeDocument = new FakeHTMLElement();
  managers = [];
  (globalThis as Record<string, unknown>).document = fakeDocument;
});

afterEach(() => {
  // The manager keeps a static instance set and a shared document listener,
  // so every manager has to be torn down even when an assertion threw.
  managers.forEach((manager) => manager.unregisterListeners());
  delete (globalThis as Record<string, unknown>).document;
});

type Callbacks = {
  onDown: jest.Mock<void, [AdaptedEvent]>;
  onUp: jest.Mock<void, [AdaptedEvent]>;
  onCancel: jest.Mock<void, [AdaptedEvent]>;
};

function createManager(): { manager: KeyboardEventManager } & Callbacks {
  const manager = new KeyboardEventManager(view as unknown as HTMLElement);

  const onDown = jest.fn<void, [AdaptedEvent]>();
  const onUp = jest.fn<void, [AdaptedEvent]>();
  const onCancel = jest.fn<void, [AdaptedEvent]>();

  manager.setOnPointerDown(onDown);
  manager.setOnPointerUp(onUp);
  manager.setOnPointerCancel(onCancel);
  manager.registerListeners();
  managers.push(manager);

  return { manager, onDown, onUp, onCancel };
}

function keyDown(key: string) {
  view.dispatchEvent('keydown', { key, target: view, timeStamp: 0 });
}

function keyUp(key: string) {
  fakeDocument.dispatchEvent('keyup', { key, target: view, timeStamp: 0 });
}

describe('KeyboardEventManager', () => {
  test('a held activation key sends a single pointer down', () => {
    const { onDown } = createManager();

    keyDown('Enter');
    keyDown('Enter');
    keyDown('Enter');

    expect(onDown).toHaveBeenCalledTimes(1);
  });

  test('releasing the key lets the next press start a new gesture', () => {
    const { onDown, onUp } = createManager();

    keyDown('Enter');
    keyUp('Enter');
    keyDown('Enter');

    expect(onDown).toHaveBeenCalledTimes(2);
    expect(onUp).toHaveBeenCalledTimes(1);
  });

  test('the press ends only once every held activation key is released', () => {
    const { onDown, onUp } = createManager();

    keyDown('Enter');
    keyDown(' ');
    keyUp(' ');

    expect(onDown).toHaveBeenCalledTimes(1);
    expect(onUp).not.toHaveBeenCalled();

    // Auto-repeat of the still held Enter must not reopen the gesture.
    keyDown('Enter');

    expect(onDown).toHaveBeenCalledTimes(1);

    keyUp('Enter');

    expect(onUp).toHaveBeenCalledTimes(1);
  });

  test('a cancelation key still cancels an ongoing press', () => {
    const { onCancel } = createManager();

    keyDown('Enter');
    keyDown('Tab');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('resetting the manager clears the pressed state', () => {
    const { manager, onDown, onUp } = createManager();

    keyDown('Enter');
    manager.resetManager();
    keyUp('Enter');

    expect(onUp).not.toHaveBeenCalled();

    keyDown('Enter');

    expect(onDown).toHaveBeenCalledTimes(2);
  });
});
