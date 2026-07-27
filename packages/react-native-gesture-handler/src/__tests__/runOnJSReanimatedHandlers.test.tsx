import { renderHook } from '@testing-library/react-native';

import { useTapGesture } from '../v3/hooks/gestures';
import type { SharedValue } from '../v3/types';

jest.mock('../handlers/gestures/reanimatedWrapper', () => {
  const Reanimated = {
    useHandler: jest.fn(() => ({
      doDependenciesDiffer: false,
      context: { lastUpdateEvent: undefined },
    })),
    useEvent: jest.fn(() => jest.fn()),
    isSharedValue: (value: unknown): boolean =>
      value !== null && typeof value === 'object' && 'value' in value,
    isWorkletFunction: (value: unknown): boolean =>
      typeof value === 'function' && '__workletHash' in value,
    makeMutable: <T,>(value: T) => ({ value }),
    runOnUI: () => jest.fn(),
    runOnJS:
      (fn: (...args: unknown[]) => unknown) =>
      (...args: unknown[]) =>
        fn(...args),
    useSharedValue: <T,>(value: T) => ({ value }),
    setGestureState: jest.fn(),
  };

  return { Reanimated };
});

const { Reanimated: MockedReanimated } = jest.requireMock(
  '../handlers/gestures/reanimatedWrapper'
) as unknown as { Reanimated: { useHandler: jest.Mock } };

const lastHandlers = () =>
  MockedReanimated.useHandler.mock.calls.at(-1)?.[0] as Record<string, unknown>;

const makeFakeSharedValue = (value: boolean) =>
  ({
    value,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    modify: jest.fn(),
  }) as unknown as SharedValue<boolean>;

// When `runOnJS` is statically `true`, the Reanimated event path can never
// receive events, so user callbacks must not be serialized to the UI runtime
// (in dev, Worklets freezes every plain object captured in their closures,
// silently dropping later writes). These tests guard the substitution in
// `useGestureCallbacks` and the re-registration when `runOnJS` changes.
describe('[API v3] Reanimated handler registration vs runOnJS', () => {
  beforeEach(() => {
    MockedReanimated.useHandler.mockClear();
  });

  test('registers an empty handler set when runOnJS is statically true', () => {
    const onActivate = jest.fn();

    renderHook(() => useTapGesture({ onActivate, runOnJS: true }));

    expect(MockedReanimated.useHandler).toHaveBeenCalled();
    for (const call of MockedReanimated.useHandler.mock.calls) {
      expect(Object.keys(call[0] as object)).toHaveLength(0);
    }
  });

  test('registers real callbacks when runOnJS is not set', () => {
    const onActivate = jest.fn();

    renderHook(() => useTapGesture({ onActivate }));

    expect(lastHandlers().onActivate).toBe(onActivate);
  });

  test('registers real callbacks when runOnJS is false', () => {
    const onActivate = jest.fn();

    renderHook(() => useTapGesture({ onActivate, runOnJS: false }));

    expect(lastHandlers().onActivate).toBe(onActivate);
  });

  test('re-registers real callbacks when runOnJS changes from true to false', () => {
    const onActivate = jest.fn();

    const { rerender } = renderHook(
      ({ runOnJS }: { runOnJS: boolean }) =>
        useTapGesture({ onActivate, runOnJS }),
      { initialProps: { runOnJS: true } }
    );

    expect(Object.keys(lastHandlers())).toHaveLength(0);

    rerender({ runOnJS: false });

    expect(lastHandlers().onActivate).toBe(onActivate);
  });

  test('swaps back to the empty handler set when runOnJS returns to true', () => {
    const onActivate = jest.fn();

    const { rerender } = renderHook(
      ({ runOnJS }: { runOnJS: boolean }) =>
        useTapGesture({ onActivate, runOnJS }),
      { initialProps: { runOnJS: false } }
    );

    expect(lastHandlers().onActivate).toBe(onActivate);

    rerender({ runOnJS: true });

    expect(Object.keys(lastHandlers())).toHaveLength(0);
  });

  test('keeps real callbacks when runOnJS is a SharedValue holding true', () => {
    const onActivate = jest.fn();

    renderHook(() =>
      useTapGesture({ onActivate, runOnJS: makeFakeSharedValue(true) })
    );

    expect(lastHandlers().onActivate).toBe(onActivate);
  });
});
