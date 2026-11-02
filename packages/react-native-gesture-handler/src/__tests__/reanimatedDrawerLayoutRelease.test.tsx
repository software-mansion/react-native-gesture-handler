import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import type { DrawerLayoutMethods } from '../components/ReanimatedDrawerLayout';
import ReanimatedDrawerLayout, {
  DrawerState,
} from '../components/ReanimatedDrawerLayout';
import { createGestureController } from '../jestUtils';
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const AnimatedView: unknown = ReactNative.View;

  // Piecewise linear, clamped at both ends.
  const interpolate = (value: number, input: number[], output: number[]) => {
    if (value <= input[0]) {
      return output[0];
    }

    for (let i = 1; i < input.length; i++) {
      if (value <= input[i]) {
        const progress = (value - input[i - 1]) / (input[i] - input[i - 1]);
        return output[i - 1] + progress * (output[i] - output[i - 1]);
      }
    }

    return output[output.length - 1];
  };

  const runUpdater = (updater: () => unknown) => updater();
  const noEventHandler = () => undefined;

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (component: unknown) => component,
    },
    View: AnimatedView,
    createAnimatedComponent: (component: unknown) => component,
    Extrapolation: { CLAMP: 'clamp' },
    interpolate,
    isSharedValue: () => false,
    useAnimatedProps: runUpdater,
    useAnimatedStyle: runUpdater,
    useComposedEventHandler: noEventHandler,
    useDerivedValue: runUpdater,
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

jest.mock('react-native-worklets', () =>
  jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock')
);

async function flushScheduledCallbacks() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}

const DRAWER_WIDTH = 200;

describe('ReanimatedDrawerLayout pan release', () => {
  const callbacks = {
    onDrawerOpen: jest.fn(),
    onDrawerClose: jest.fn(),
    onDrawerStateChanged: jest.fn(),
  };

  function renderDrawer() {
    const drawerRef = React.createRef<DrawerLayoutMethods>();
    let progress: SharedValue<number> | undefined;

    render(
      <GestureHandlerRootView>
        <ReanimatedDrawerLayout
          ref={drawerRef}
          drawerWidth={DRAWER_WIDTH}
          renderNavigationView={(value) => {
            progress = value;
            return <Text>Drawer</Text>;
          }}
          {...callbacks}>
          <Text>Content</Text>
        </ReanimatedDrawerLayout>
      </GestureHandlerRootView>
    );

    if (!mockLastPanGesture || !progress) {
      throw new Error('ReanimatedDrawerLayout did not render');
    }

    return {
      pan: createGestureController(mockLastPanGesture),
      drawerRef,
      progress: () => progress?.value,
    };
  }

  function clearCallbacks() {
    Object.values(callbacks).forEach((callback) => callback.mockClear());
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens the drawer when the pan ends past half of its width', async () => {
    const { pan, progress } = renderDrawer();

    pan.begin({ x: 10 });
    pan.activate({ x: 13, translationX: 3 });
    pan.update({ x: 160, translationX: 150 });
    pan.end({ x: 160, translationX: 150, velocityX: 0 });
    await flushScheduledCallbacks();

    expect(callbacks.onDrawerOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onDrawerClose).not.toHaveBeenCalled();
    expect(progress()).toBe(1);
  });

  test.each(['cancel', 'fail'] as const)(
    'keeps a closed drawer closed when the pan is %sed past half of its width',
    async (action) => {
      const { pan, progress } = renderDrawer();

      pan.begin({ x: 10 });
      pan.activate({ x: 13, translationX: 3 });
      pan.update({ x: 160, translationX: 150 });
      pan[action]({ x: 160, translationX: 150, velocityX: 0 });
      await flushScheduledCallbacks();

      expect(callbacks.onDrawerOpen).not.toHaveBeenCalled();
      expect(callbacks.onDrawerStateChanged).toHaveBeenLastCalledWith(
        DrawerState.IDLE,
        false
      );
      expect(progress()).toBe(0);
    }
  );

  test.each(['cancel', 'fail'] as const)(
    'keeps an open drawer open when the pan is %sed past half of its width',
    async (action) => {
      const { pan, drawerRef, progress } = renderDrawer();

      drawerRef.current?.openDrawer();
      await flushScheduledCallbacks();
      expect(progress()).toBe(1);
      clearCallbacks();

      pan.begin({ x: 190 });
      pan.activate({ x: 187, translationX: -3 });
      pan.update({ x: 40, translationX: -150 });
      pan[action]({ x: 40, translationX: -150, velocityX: 0 });
      await flushScheduledCallbacks();

      expect(callbacks.onDrawerClose).not.toHaveBeenCalled();
      expect(callbacks.onDrawerStateChanged).toHaveBeenLastCalledWith(
        DrawerState.IDLE,
        true
      );
      expect(progress()).toBe(1);
    }
  );
});
