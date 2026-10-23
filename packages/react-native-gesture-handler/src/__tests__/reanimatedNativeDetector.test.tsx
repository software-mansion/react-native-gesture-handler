import { fireEvent, render } from '@testing-library/react-native';
import React, { act, Activity, useEffect, useState } from 'react';
import * as ReactNative from 'react-native';
import type { ReactTestRenderer } from 'react-test-renderer';
import { create } from 'react-test-renderer';

import type { NativeEventsManager } from '../handlers/gestures/reanimatedWrapper';
import type { RNGestureHandlerDetectorNativeComponentProps } from '../v3/detectors/HostGestureDetector';
import { ReanimatedNativeDetector } from '../v3/detectors/ReanimatedNativeDetector';

// Keep Reanimated's event diffing; replace only its native registration boundary.
jest.mock('react-native-reanimated/src/WorkletEventHandler', () => ({
  WorkletEventHandler: class {
    registered = new Set<number>();
    registerForEvents = jest.fn((tag: number) => this.registered.add(tag));
    unregisterFromEvents = jest.fn((tag: number) =>
      this.registered.delete(tag)
    );
  },
}));

jest.mock(
  'react-native-reanimated/src/platform-specific/findHostInstance',
  () => ({
    findHostInstance: jest.fn(() => {
      throw new Error('Expected the retained detector tag');
    }),
  })
);

jest.mock(
  'react-native-reanimated/src/platformFunctions/findNodeHandle',
  () => ({
    findNodeHandle: jest.fn(() => 42),
  })
);

jest.mock('../handlers/gestures/reanimatedWrapper', () => ({
  Reanimated: jest.requireActual<{ NativeEventsManager: NativeEventsManager }>(
    'react-native-reanimated/src/createAnimatedComponent/NativeEventsManager'
  ),
}));

type RecordedHandler = {
  registered: Set<number>;
  registerForEvents: jest.Mock;
  unregisterFromEvents: jest.Mock;
};

// The wrapper mock always supplies NativeEventsManager.
const Detector = ReanimatedNativeDetector as NonNullable<
  typeof ReanimatedNativeDetector
>;

const { WorkletEventHandler } = jest.requireMock<{
  WorkletEventHandler: new () => RecordedHandler;
}>('react-native-reanimated/src/WorkletEventHandler');

type WorkletProp =
  RNGestureHandlerDetectorNativeComponentProps['onGestureHandlerReanimatedEvent'];

const eventProp = (handler: RecordedHandler) =>
  ({ workletEventHandler: handler }) as unknown as WorkletProp;

describe('ReanimatedNativeDetector event registrations', () => {
  let findNodeHandle: jest.SpyInstance;

  beforeEach(() => {
    findNodeHandle = jest
      .spyOn(
        jest.requireActual<typeof ReactNative>('react-native'),
        'findNodeHandle'
      )
      .mockReturnValue(42);
  });

  afterEach(() => {
    findNodeHandle.mockRestore();
  });

  test('replaces handlers while preserving the host and child state', () => {
    const first = new WorkletEventHandler();
    const second = new WorkletEventHandler();
    const third = new WorkletEventHandler();
    const mounted = jest.fn();
    const unmounted = jest.fn();

    function Child() {
      const [count, setCount] = useState(0);
      useEffect(() => {
        mounted();
        return () => {
          unmounted();
        };
      }, []);
      return (
        <ReactNative.Pressable
          testID="child"
          onPress={() => setCount(count + 1)}>
          <ReactNative.Text>{count}</ReactNative.Text>
        </ReactNative.Pressable>
      );
    }

    const tree = (handler: RecordedHandler) => (
      <Detector
        handlerTags={[1]}
        virtualChildren={[]}
        testID="detector"
        onGestureHandlerReanimatedEvent={eventProp(handler)}>
        <Child />
      </Detector>
    );
    const view = render(tree(first));
    const host = view.getByTestId('detector');
    fireEvent.press(view.getByTestId('child'));
    expect([...first.registered]).toEqual([42]);

    for (const handler of [second, first, second, third]) {
      view.rerender(tree(handler));
      for (const candidate of [first, second, third]) {
        expect([...candidate.registered]).toEqual(
          candidate === handler ? [42] : []
        );
      }
      expect(view.getByTestId('detector')).toBe(host);
      expect(view.getByText('1')).toBeDefined();
      expect(mounted).toHaveBeenCalledTimes(1);
      expect(unmounted).not.toHaveBeenCalled();
    }

    view.unmount();
    expect([...third.registered]).toEqual([]);
    expect(third.unregisterFromEvents).toHaveBeenCalledTimes(1);
    expect(unmounted).toHaveBeenCalledTimes(1);
  });

  test('adds and removes a handler on the retained host', () => {
    const handler = new WorkletEventHandler();
    const view = render(<Detector handlerTags={[1]} virtualChildren={[]} />);
    view.rerender(
      <Detector
        handlerTags={[1]}
        virtualChildren={[]}
        onGestureHandlerReanimatedEvent={eventProp(handler)}
      />
    );
    expect([...handler.registered]).toEqual([42]);
    view.rerender(<Detector handlerTags={[1]} virtualChildren={[]} />);
    expect([...handler.registered]).toEqual([]);
    expect(handler.unregisterFromEvents).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(handler.unregisterFromEvents).toHaveBeenCalledTimes(1);
  });

  test('keeps an unchanged handler registered until unmount', () => {
    const handler = new WorkletEventHandler();
    const tree = (label: string) => (
      <Detector
        handlerTags={[1]}
        virtualChildren={[]}
        accessibilityLabel={label}
        onGestureHandlerReanimatedEvent={eventProp(handler)}
      />
    );
    const view = render(tree('first'));
    view.rerender(tree('second'));
    expect(handler.registerForEvents).toHaveBeenCalledTimes(1);
    expect(handler.unregisterFromEvents).not.toHaveBeenCalled();
    view.unmount();
    expect(handler.unregisterFromEvents).toHaveBeenCalledTimes(1);
    expect([...handler.registered]).toEqual([]);
  });

  test.each(['hidden', 'visible'] as const)(
    'attaches the current handler once when an initially %s Activity is revealed',
    async (initialMode) => {
      const first = new WorkletEventHandler();
      const second = new WorkletEventHandler();
      const tree = (mode: 'hidden' | 'visible', handler: RecordedHandler) => (
        <Activity mode={mode}>
          <Detector
            handlerTags={[1]}
            virtualChildren={[]}
            onGestureHandlerReanimatedEvent={eventProp(handler)}
          />
        </Activity>
      );
      const options = {
        createNodeMock: () => null,
        unstable_isConcurrent: true,
      };
      let renderer!: ReactTestRenderer;
      await act(() => {
        renderer = create(tree(initialMode, first), options);
        return Promise.resolve();
      });
      expect(first.registerForEvents).toHaveBeenCalledTimes(
        initialMode === 'visible' ? 1 : 0
      );

      await act(() => Promise.resolve(renderer.update(tree('hidden', first))));
      expect([...first.registered]).toEqual([]);
      await act(() => Promise.resolve(renderer.update(tree('hidden', second))));
      expect(second.registerForEvents).not.toHaveBeenCalled();

      await act(() =>
        Promise.resolve(renderer.update(tree('visible', second)))
      );
      expect([...first.registered]).toEqual([]);
      expect([...second.registered]).toEqual([42]);
      expect(second.registerForEvents).toHaveBeenCalledTimes(1);

      await act(() => Promise.resolve(renderer.unmount()));
      expect([...first.registered]).toEqual([]);
      expect([...second.registered]).toEqual([]);
      expect(second.unregisterFromEvents).toHaveBeenCalledTimes(1);
    }
  );
});
