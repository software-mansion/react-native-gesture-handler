import { act, render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import { withSpring } from 'react-native-reanimated';

import GestureHandlerRootView from '../components/GestureHandlerRootView';
import ReanimatedDrawerLayout, {
  type DrawerLayoutMethods,
} from '../components/ReanimatedDrawerLayout';

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
    Extrapolation: { CLAMP: 'clamp' },
    interpolate: (value: number) => value,
    isSharedValue: () => false,
    useAnimatedProps: () => ({}),
    useAnimatedStyle: () => ({}),
    useDerivedValue: () => undefined,
    useSharedValue: (initialValue: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const ref = ReactActual.useRef({ value: initialValue });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return ref.current;
    },
    withSpring: jest.fn((toValue: unknown) => toValue),
  };
});

jest.mock('react-native-worklets', () =>
  jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock')
);

jest.mock('../v3/detectors', () => ({
  InterceptingGestureDetector: ({ children }: { children: React.ReactNode }) =>
    children,
  VirtualGestureDetector: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('../v3/hooks/gestures', () => ({
  usePanGesture: (config: unknown) => config,
  useTapGesture: (config: unknown) => config,
}));

function Drawer({
  animationSpeed,
  drawerRef,
}: {
  animationSpeed: number;
  drawerRef: React.Ref<DrawerLayoutMethods>;
}) {
  return (
    <GestureHandlerRootView>
      <ReanimatedDrawerLayout
        ref={drawerRef}
        animationSpeed={animationSpeed}
        renderNavigationView={() => <View testID="drawer" />}>
        <View testID="content" />
      </ReanimatedDrawerLayout>
    </GestureHandlerRootView>
  );
}

async function openDrawer(
  drawerRef: React.RefObject<DrawerLayoutMethods | null>
) {
  await act(async () => {
    drawerRef.current?.openDrawer();
    await new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });
  });
}

describe('ReanimatedDrawerLayout animation speed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses the latest animationSpeed prop after rerender', async () => {
    const drawerRef = React.createRef<DrawerLayoutMethods>();
    const { rerender } = render(
      <Drawer animationSpeed={2} drawerRef={drawerRef} />
    );

    await openDrawer(drawerRef);
    expect(jest.mocked(withSpring).mock.calls.at(-1)?.[1]).toEqual(
      expect.objectContaining({ mass: 0.5 })
    );

    jest.mocked(withSpring).mockClear();
    rerender(<Drawer animationSpeed={4} drawerRef={drawerRef} />);

    await openDrawer(drawerRef);
    expect(jest.mocked(withSpring).mock.calls.at(-1)?.[1]).toEqual(
      expect.objectContaining({ mass: 0.25 })
    );
  });
});
