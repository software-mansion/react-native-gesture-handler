import { bindSharedValues } from '../v3/hooks/utils/reanimatedUtils';
import type { BaseGestureConfig, SharedValue } from '../v3/types';

const mockUpdateGestureHandlerConfig = jest.fn();

// `bindSharedValues` pushes updates straight to the native side from the UI
// thread, bypassing `prepareConfigForNativeSide` entirely. It is the one
// producer that is easy to forget when touching the config pipeline, so it gets
// its own test with the surrounding modules stubbed out.
jest.mock('../v3/NativeProxy', () => ({
  NativeProxy: {
    // Forwarded lazily — the mocked module is required (imports and `jest.mock`
    // calls are both hoisted) before the `jest.fn()` has been initialized.
    updateGestureHandlerConfig: (...args: unknown[]) =>
      mockUpdateGestureHandlerConfig(...args),
  },
}));

jest.mock('../handlers/gestures/reanimatedWrapper', () => ({
  Reanimated: {
    isSharedValue: (value: unknown) =>
      typeof value === 'object' &&
      value !== null &&
      '__isFakeSharedValue' in value,
    runOnUI:
      <TArgs extends unknown[]>(fn: (...args: TArgs) => void) =>
      (...args: TArgs): void =>
        fn(...args),
  },
}));

type Listener = (value: unknown) => void;

function fakeSharedValue(value: unknown) {
  const listeners = new Map<number, Listener>();

  return {
    __isFakeSharedValue: true,
    value,
    addListener: (id: number, listener: Listener) =>
      listeners.set(id, listener),
    removeListener: (id: number) => listeners.delete(id),
    emit: (next: unknown) => listeners.forEach((listener) => listener(next)),
  };
}

const bind = (config: object) =>
  bindSharedValues(
    config as BaseGestureConfig<object, unknown, unknown>,
    // Arbitrary handler tag.
    7
  );

describe('bindSharedValues', () => {
  beforeEach(() => {
    mockUpdateGestureHandlerConfig.mockClear();
  });

  test('normalizes a hitSlop pushed from the UI thread', () => {
    const hitSlop = fakeSharedValue(-10);
    bind({ hitSlop: hitSlop as unknown as SharedValue });

    hitSlop.emit({ horizontal: -10, top: -5 });

    expect(mockUpdateGestureHandlerConfig).toHaveBeenCalledWith(7, {
      hitSlop: [-10, -5, -10, null, null, null],
    });
  });

  test('passes an explicitly null hitSlop through', () => {
    const hitSlop = fakeSharedValue(-10);
    bind({ hitSlop: hitSlop as unknown as SharedValue });

    hitSlop.emit(null);

    expect(mockUpdateGestureHandlerConfig).toHaveBeenCalledWith(7, {
      hitSlop: null,
    });
  });

  test('leaves other config values untouched', () => {
    const enabled = fakeSharedValue(true);
    bind({ enabled: enabled as unknown as SharedValue });

    enabled.emit(false);

    expect(mockUpdateGestureHandlerConfig).toHaveBeenCalledWith(7, {
      enabled: false,
    });
  });
});
