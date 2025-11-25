import { usePanGesture } from '../v3/hooks/gestures';
import { render, renderHook } from '@testing-library/react-native';
import { fireGestureHandler, getByGestureTestId } from '../jestUtils';
import { State } from '../State';
import GestureHandlerRootView from '../components/GestureHandlerRootView';
import { RectButton } from '../v3/components';
import { act } from 'react';

describe('[API v3] Hooks', () => {
  test('Pan gesture', () => {
    const onBegin = jest.fn();
    const onStart = jest.fn();

    const panGesture = renderHook(() =>
      usePanGesture({
        disableReanimated: true,
        onBegin: (e) => onBegin(e),
        onStart: (e) => onStart(e),
      })
    ).result.current;

    fireGestureHandler(panGesture, [
      { oldState: State.UNDETERMINED, state: State.BEGAN },
      { oldState: State.BEGAN, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.ACTIVE },
      { oldState: State.ACTIVE, state: State.END },
    ]);

    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe('[API v3] Components', () => {
  test('Rect Button', () => {
    const pressFn = jest.fn();

    const RectButtonExample = () => {
      return (
        <GestureHandlerRootView>
          <RectButton testID="btn" onPress={pressFn} />
        </GestureHandlerRootView>
      );
    };

    render(<RectButtonExample />);

    const nativeGesture = getByGestureTestId('btn');

    act(() => {
      fireGestureHandler(nativeGesture, [
        { oldState: State.UNDETERMINED, state: State.BEGAN },
        { oldState: State.BEGAN, state: State.ACTIVE },
        { oldState: State.ACTIVE, state: State.END },
      ]);
    });

    expect(pressFn).toHaveBeenCalledTimes(1);
  });
});
