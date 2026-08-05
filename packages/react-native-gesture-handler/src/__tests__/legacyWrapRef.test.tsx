import { cleanup, render } from '@testing-library/react-native';
import React from 'react';
import { findNodeHandle, View } from 'react-native';

import { Gesture, GestureDetector, GestureHandlerRootView } from '../index';
import RNGestureHandlerModule from '../RNGestureHandlerModule';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  findNodeHandle: jest.fn(),
}));

const VIEW_TAG = 123;

function ChildIgnoringRef(props: { children?: React.ReactNode }) {
  return <View>{props.children}</View>;
}

class ChildWithHostInstance extends React.Component<{
  children?: React.ReactNode;
}> {
  // eslint-disable-next-line @eslint-react/no-unused-class-component-members
  public __internalInstanceHandle = {};

  override render() {
    return <View>{this.props.children}</View>;
  }
}

describe('Legacy GestureDetector ref forwarding', () => {
  let attachSpy: jest.SpyInstance;

  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
    (findNodeHandle as jest.Mock).mockReturnValue(VIEW_TAG);
    attachSpy = jest.spyOn(RNGestureHandlerModule, 'attachGestureHandler');
  });

  afterEach(() => {
    attachSpy.mockRestore();
  });

  test('resolves the tag from the child host instance when its ref resolves', () => {
    render(
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Tap()}>
          <ChildWithHostInstance />
        </GestureDetector>
      </GestureHandlerRootView>
    );

    const resolvedRefs = (findNodeHandle as jest.Mock).mock.calls.map(
      (call) => call[0]
    );

    expect(resolvedRefs.length).toBeGreaterThan(0);
    expect(
      resolvedRefs.every(
        (ref) => ref instanceof ChildWithHostInstance && ref !== null
      )
    ).toBe(true);
    expect(attachSpy).toHaveBeenCalledWith(
      expect.any(Number),
      VIEW_TAG,
      expect.any(Number)
    );
  });

  test('attaches gestures when the child ignores its ref', () => {
    render(
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Tap()}>
          <ChildIgnoringRef />
        </GestureDetector>
      </GestureHandlerRootView>
    );

    const resolvedRefs = (findNodeHandle as jest.Mock).mock.calls.map(
      (call) => call[0]
    );

    expect(resolvedRefs.length).toBeGreaterThan(0);
    expect(
      resolvedRefs.every((ref) => ref instanceof ChildWithHostInstance)
    ).toBe(false);
    expect(attachSpy).toHaveBeenCalledWith(
      expect.any(Number),
      VIEW_TAG,
      expect.any(Number)
    );
  });

  test('does not clobber a ref the child already has', () => {
    const childRef = jest.fn();

    render(
      <GestureHandlerRootView>
        <GestureDetector gesture={Gesture.Tap()}>
          <View ref={childRef} />
        </GestureDetector>
      </GestureHandlerRootView>
    );

    expect(childRef).toHaveBeenCalled();
    expect(childRef.mock.calls[0][0]).not.toBeNull();
  });

  test('does not reattach gestures on re-render', () => {
    const gesture = Gesture.Tap();

    function App() {
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={gesture}>
            <View />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const { rerender } = render(<App />);
    expect(attachSpy).toHaveBeenCalledTimes(1);

    rerender(<App />);
    rerender(<App />);

    expect(attachSpy).toHaveBeenCalledTimes(1);
  });
});
