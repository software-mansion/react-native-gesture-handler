import type { CoreRuntime } from '@swmansion/gesture-handler-core';

import { bindSharedValues } from '../v3/hooks/utils/reanimatedUtils';
import type { BaseGestureConfig, SharedValue } from '../v3/types';

const mockUpdateGestureHandlerConfig = jest.fn();

// `bindSharedValues` pushes updates straight to the native side from the UI
// thread, bypassing `prepareConfigForNativeSide` entirely. It is the one
// producer that is easy to forget when touching the config pipeline, so it gets
// its own test with a hand-built runtime standing in for the platform port.
const runtime = {
  port: {
    proxy: {
      updateGestureHandlerConfig: (...args: unknown[]) =>
        mockUpdateGestureHandlerConfig(...args),
    },
    reanimated: {},
    worklets: {
      scheduleOnUI: <TArgs extends unknown[]>(
        fn: (...args: TArgs) => void,
        ...args: TArgs
      ): void => fn(...args),
    },
  },
} as unknown as CoreRuntime;

type Listener = (value: unknown) => void;

function fakeSharedValue(value: unknown) {
  const listeners = new Map<number, Listener>();

  return {
    // The marker core's structural `isSharedValue` checks for.
    _isReanimatedSharedValue: true,
    value,
    addListener: (id: number, listener: Listener) =>
      listeners.set(id, listener),
    removeListener: (id: number) => listeners.delete(id),
    emit: (next: unknown) => listeners.forEach((listener) => listener(next)),
  };
}

const bind = (config: object) =>
  bindSharedValues(
    runtime,
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

  test('sends an explicitly null hitSlop as unset slots', () => {
    const hitSlop = fakeSharedValue(-10);
    bind({ hitSlop: hitSlop as unknown as SharedValue });

    hitSlop.emit(null);

    expect(mockUpdateGestureHandlerConfig).toHaveBeenCalledWith(7, {
      hitSlop: [null, null, null, null, null, null],
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
