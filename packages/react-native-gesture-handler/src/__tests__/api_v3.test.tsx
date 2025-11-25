import { usePanGesture } from '../v3/hooks/gestures';
import { renderHook } from '@testing-library/react-native';
import { fireGestureHandler } from '../jestUtils';
import { State } from '../State';

describe('API v3 - usePanGesture hook', () => {
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
