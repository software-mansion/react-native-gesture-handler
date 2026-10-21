import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';
import { withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import type {
  SwipeableMethods,
  SwipeableProps,
} from '../components/ReanimatedSwipeable';
import ReanimatedSwipeable from '../components/ReanimatedSwipeable';
import { createGestureController } from '../jestUtils';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import type * as Gestures from '../v3/hooks/gestures';

let mockLastPanGesture: Gestures.PanGesture | undefined;

jest.mock('../v3/hooks/gestures', () => {
  const actual = jest.requireActual<typeof Gestures>('../v3/hooks/gestures');

  return {
    ...actual,
    usePanGesture: jest.fn(
      (...args: Parameters<typeof actual.usePanGesture>) => {
        mockLastPanGesture = actual.usePanGesture(...args);
        return mockLastPanGesture;
      }
    ),
  };
});

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const ReactNative = jest.requireActual('react-native');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const ReactActual = jest.requireActual('react');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const AnimatedView = ReactNative.View;

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (component: unknown) => component,
    },
    View: AnimatedView,
    createAnimatedComponent: (component: unknown) => component,
    interpolate: (value: number) => value,
    isSharedValue: () => false,
    measure: () => ({ pageX: 0 }),
    ReduceMotion: { System: 'system' },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    useAnimatedRef: () => ReactActual.useRef(null),
    useAnimatedStyle: (updater: () => object) => updater(),
    useSharedValue: (init: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const ref = ReactActual.useRef({ value: init });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return ref.current;
    },
    withSpring: jest.fn(
      (
        to: unknown,
        _config: unknown,
        callback?: (finished: boolean) => void
      ) => {
        callback?.(true);
        return to;
      }
    ),
  };
});

jest.mock('react-native-worklets', () => {
  const WorkletsMock = jest.requireActual<
    Record<string, unknown> & { scheduleOnRN: typeof scheduleOnRN }
  >('react-native-worklets/src/mock');

  return {
    ...WorkletsMock,
    scheduleOnRN: jest.fn(WorkletsMock.scheduleOnRN),
  };
});

async function flushNativeOps() {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
  await new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}

function SwipeableRow({
  swipeableRef,
  onSwipeableOpen,
  onSwipeableClose,
  onSwipeableWillOpen,
  onSwipeableWillClose,
  onSwipeableOpenStartDrag,
  onSwipeableCloseStartDrag,
}: {
  swipeableRef?: React.Ref<SwipeableMethods>;
  onSwipeableOpen: NonNullable<SwipeableProps['onSwipeableOpen']>;
  onSwipeableClose: NonNullable<SwipeableProps['onSwipeableClose']>;
  onSwipeableWillOpen: NonNullable<SwipeableProps['onSwipeableWillOpen']>;
  onSwipeableWillClose: NonNullable<SwipeableProps['onSwipeableWillClose']>;
  onSwipeableOpenStartDrag: NonNullable<
    SwipeableProps['onSwipeableOpenStartDrag']
  >;
  onSwipeableCloseStartDrag: NonNullable<
    SwipeableProps['onSwipeableCloseStartDrag']
  >;
}) {
  const fallbackRef = React.useRef<SwipeableMethods>(null);

  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        ref={swipeableRef ?? fallbackRef}
        renderRightActions={() => <Text>Delete</Text>}
        onSwipeableOpen={onSwipeableOpen}
        onSwipeableClose={onSwipeableClose}
        onSwipeableWillOpen={onSwipeableWillOpen}
        onSwipeableWillClose={onSwipeableWillClose}
        onSwipeableOpenStartDrag={onSwipeableOpenStartDrag}
        onSwipeableCloseStartDrag={onSwipeableCloseStartDrag}>
        <Text>Row</Text>
      </ReanimatedSwipeable>
    </GestureHandlerRootView>
  );
}

function inlineCallbacks() {
  return {
    onSwipeableOpen: () => undefined,
    onSwipeableClose: () => undefined,
    onSwipeableWillOpen: () => undefined,
    onSwipeableWillClose: () => undefined,
    onSwipeableOpenStartDrag: () => undefined,
    onSwipeableCloseStartDrag: () => undefined,
  };
}

describe('ReanimatedSwipeable callback identity', () => {
  let setConfigSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    setConfigSpy = jest.spyOn(
      RNGestureHandlerModule,
      'setGestureHandlerConfig'
    );
    jest.mocked(scheduleOnRN).mockClear();
  });

  afterEach(() => {
    setConfigSpy.mockRestore();
  });

  test('does not reconfigure native handlers when only event callback identities change', async () => {
    const { rerender } = render(<SwipeableRow {...inlineCallbacks()} />);
    await flushNativeOps();

    const callsAfterMount = setConfigSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    rerender(<SwipeableRow {...inlineCallbacks()} />);
    await flushNativeOps();

    expect(setConfigSpy.mock.calls.length).toBe(callsAfterMount);
  });

  test('invokes the latest event callbacks after a callback-only rerender', async () => {
    const first = {
      ...inlineCallbacks(),
      onSwipeableWillClose: jest.fn(),
    };
    const second = {
      ...inlineCallbacks(),
      onSwipeableWillClose: jest.fn(),
    };
    const swipeableRef = React.createRef<SwipeableMethods>();

    const { rerender } = render(
      <SwipeableRow {...first} swipeableRef={swipeableRef} />
    );

    swipeableRef.current?.close();
    await flushNativeOps();
    expect(first.onSwipeableWillClose).toHaveBeenCalledTimes(1);
    expect(second.onSwipeableWillClose).not.toHaveBeenCalled();

    rerender(<SwipeableRow {...second} swipeableRef={swipeableRef} />);

    swipeableRef.current?.close();
    await flushNativeOps();
    expect(first.onSwipeableWillClose).toHaveBeenCalledTimes(1);
    expect(second.onSwipeableWillClose).toHaveBeenCalledTimes(1);
  });

  test('does not schedule JS work when event callbacks are absent', async () => {
    const swipeableRef = React.createRef<SwipeableMethods>();

    render(
      <GestureHandlerRootView>
        <ReanimatedSwipeable
          ref={swipeableRef}
          renderRightActions={() => <Text>Delete</Text>}>
          <Text>Row</Text>
        </ReanimatedSwipeable>
      </GestureHandlerRootView>
    );

    swipeableRef.current?.close();
    await flushNativeOps();
    expect(scheduleOnRN).not.toHaveBeenCalled();
  });
});

const ROW_WIDTH = 300;

function getHostStyle(text: string) {
  let node = screen.getByText(text).parent;
  while (node && typeof node.type !== 'string') {
    node = node.parent;
  }
  return StyleSheet.flatten(node?.props.style as StyleProp<ViewStyle>) ?? {};
}

describe('ReanimatedSwipeable release and action panes', () => {
  const callbacks = {
    onSwipeableOpen: jest.fn(),
    onSwipeableWillOpen: jest.fn(),
    onSwipeableClose: jest.fn(),
    onSwipeableWillClose: jest.fn(),
  };

  function expectNoSwipeableCallbacks() {
    for (const callback of Object.values(callbacks)) {
      expect(callback).not.toHaveBeenCalled();
    }
  }

  function renderRow() {
    const swipeableRef = React.createRef<SwipeableMethods>();
    const row = () => (
      <GestureHandlerRootView>
        <ReanimatedSwipeable
          ref={swipeableRef}
          renderLeftActions={() => <Text>Archive</Text>}
          renderRightActions={() => <Text>Delete</Text>}
          {...callbacks}>
          <Text style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}>
            Row
          </Text>
        </ReanimatedSwipeable>
      </GestureHandlerRootView>
    );
    const { rerender } = render(row());
    let container = screen.getByText('Row').parent;
    while (container && !container.props.onLayout) {
      container = container.parent;
    }
    if (!container || !mockLastPanGesture) {
      throw new Error('ReanimatedSwipeable did not render');
    }
    fireEvent(container, 'layout', {
      nativeEvent: { layout: { width: ROW_WIDTH } },
    });

    return {
      pan: createGestureController(mockLastPanGesture),
      refreshStyles: () => rerender(row()),
      swipeableRef,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens the row when the pan ends past the threshold', async () => {
    const { pan, refreshStyles } = renderRow();

    pan.begin();
    pan.activate({ translationX: -20 });
    pan.update({ translationX: -200 });
    pan.end({ translationX: -200 });
    await flushNativeOps();
    refreshStyles();

    expect(callbacks.onSwipeableOpen).toHaveBeenCalledTimes(1);
    expect(getHostStyle('Row').transform).toEqual([{ translateX: -ROW_WIDTH }]);
  });

  test.each(['cancel', 'fail'] as const)(
    'keeps a closed row closed without callbacks when the pan is %sed past the threshold',
    async (action) => {
      const { pan, refreshStyles } = renderRow();

      pan.begin();
      pan.activate({ translationX: -20 });
      pan.update({ translationX: -200 });
      pan[action]({ translationX: -200 });
      await flushNativeOps();
      refreshStyles();

      expectNoSwipeableCallbacks();
      expect(getHostStyle('Row').transform).toEqual([{ translateX: 0 }]);
    }
  );

  test.each(['cancel', 'fail'] as const)(
    'keeps an open row open without callbacks when the pan is %sed past the threshold',
    async (action) => {
      const { pan, refreshStyles } = renderRow();

      pan.begin();
      pan.activate({ translationX: -20 });
      pan.update({ translationX: -200 });
      pan.end({ translationX: -200 });
      await flushNativeOps();
      Object.values(callbacks).forEach((callback) => callback.mockClear());

      pan.begin();
      pan.activate({ translationX: 20 });
      pan.update({ translationX: 200 });
      pan[action]({ translationX: 200 });
      await flushNativeOps();
      refreshStyles();

      expectNoSwipeableCallbacks();
      expect(getHostStyle('Row').transform).toEqual([
        { translateX: -ROW_WIDTH },
      ]);
    }
  );

  test('finishes an open animation that a cancelled pan interrupted', async () => {
    const { pan, swipeableRef } = renderRow();

    // The open animation is still running when the pan starts.
    jest.mocked(withSpring).mockImplementationOnce((to) => to);
    swipeableRef.current?.openRight();
    await flushNativeOps();
    expect(callbacks.onSwipeableWillOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onSwipeableOpen).not.toHaveBeenCalled();

    pan.begin();
    pan.activate({ translationX: 20 });
    pan.update({ translationX: 50 });
    pan.cancel({ translationX: 50 });
    await flushNativeOps();

    expect(callbacks.onSwipeableWillOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onSwipeableOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onSwipeableWillClose).not.toHaveBeenCalled();
    expect(callbacks.onSwipeableClose).not.toHaveBeenCalled();
  });
});
