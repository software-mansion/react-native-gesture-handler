import { cleanup, render } from '@testing-library/react-native';
import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  RectButton,
  Switch,
  TextInput,
  useNativeGesture,
  usePanGesture,
  useSimultaneousGestures,
} from '../index';

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock')
);

const WARNING = 'already has a Native gesture attached by Gesture Handler';

describe('Native gesture wrapping a native wrapper', () => {
  let consoleWarn: jest.SpyInstance;

  beforeEach(() => {
    cleanup();
    consoleWarn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarn.mockRestore();
  });

  test('does not warn for a component that is not wrapped', () => {
    function Example() {
      const native = useNativeGesture({});
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={native}>
            <RNScrollView />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    render(<Example />);

    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining(WARNING)
    );
  });

  test('does not warn for a gesture other than Native', () => {
    function Example() {
      const pan = usePanGesture({});
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={pan}>
            <Switch />
          </GestureDetector>
          <GestureDetector gesture={Gesture.Pan()}>
            <Switch />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    render(<Example />);

    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining(WARNING)
    );
  });

  test('warns once for a Native gesture', () => {
    function Example() {
      const native = useNativeGesture({});
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={native}>
            <Switch />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const screen = render(<Example />);
    screen.rerender(<Example />);

    expect(consoleWarn).toHaveBeenCalledTimes(1);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining(`Switch ${WARNING}`)
    );
  });

  test('warns for a Native gesture inside a composed gesture', () => {
    function Example() {
      const pan = usePanGesture({});
      const native = useNativeGesture({});
      const composed = useSimultaneousGestures(pan, native);
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={composed}>
            <RectButton />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    render(<Example />);

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining(`RectButton ${WARNING}`)
    );
  });

  test('warns for each place rendering the detector', () => {
    function Row() {
      const native = useNativeGesture({});
      return (
        <GestureDetector gesture={native}>
          <Switch />
        </GestureDetector>
      );
    }

    function Example() {
      const native = useNativeGesture({});
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={native}>
            <Switch />
          </GestureDetector>
          {[0, 1, 2].map((i) => (
            <Row key={i} />
          ))}
        </GestureHandlerRootView>
      );
    }

    render(<Example />);

    expect(consoleWarn).toHaveBeenCalledTimes(2);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringMatching(/in GestureDetector\n {4}in Example$/)
    );
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringMatching(/in GestureDetector\n {4}in Row/)
    );
  });

  test('does not warn for a legacy Native gesture', () => {
    render(
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Native()}>
          <TextInput />
        </GestureDetector>
      </GestureHandlerRootView>
    );

    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining(WARNING)
    );
  });
});
