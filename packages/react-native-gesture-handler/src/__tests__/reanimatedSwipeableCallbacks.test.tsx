import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import type {
  SwipeableMethods,
  SwipeableProps,
} from '../components/ReanimatedSwipeable';
import ReanimatedSwipeable from '../components/ReanimatedSwipeable';
import RNGestureHandlerModule from '../RNGestureHandlerModule';

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
    measure: () => null,
    ReduceMotion: { System: 'system' },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    useAnimatedRef: () => ReactActual.useRef(null),
    useAnimatedStyle: () => ({}),
    useSharedValue: (init: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const ref = ReactActual.useRef({ value: init });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return ref.current;
    },
    withSpring: (to: unknown) => to,
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
