import { tagMessage } from '../utils';
import { useExclusive, useRace, useSimultaneous } from '../v3/hooks/relations';
import { useGesture } from '../v3/hooks/useGesture';
import { configureRelations } from '../v3/NativeDetector/utils';
import { SingleGesture, SingleGestureName } from '../v3/types';
import { renderHook } from '@testing-library/react-native';

describe('Ensure only one leaf node', () => {
  let pan1: SingleGesture<unknown, unknown>,
    pan2: SingleGesture<unknown, unknown>,
    pan3: SingleGesture<unknown, unknown>;

  beforeEach(() => {
    pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
  });

  const errorMessage = tagMessage(
    'Each gesture can be used only once in the gesture composition.'
  );

  test('useSimultaneous', () => {
    expect(() => useSimultaneous(pan1, pan1)).toThrow(errorMessage);
  });

  test('useExclusive', () => {
    expect(() => useExclusive(pan1, pan1)).toThrow(errorMessage);
  });

  test('useRace', () => {
    expect(() => useRace(pan1, pan1)).toThrow(errorMessage);
  });

  test('Complex composition', () => {
    const exclusive1 = renderHook(() => useExclusive(pan1, pan2)).result
      .current;
    const exclusive2 = renderHook(() => useExclusive(pan1, pan3)).result
      .current;

    expect(() => useSimultaneous(exclusive1, exclusive2)).toThrow(errorMessage);
  });
});

describe('Simple relations', () => {
  let pan1: SingleGesture<unknown, unknown>,
    pan2: SingleGesture<unknown, unknown>;

  beforeEach(() => {
    pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
  });

  test('useSimultaneous', () => {
    const composedGesture = renderHook(() => useSimultaneous(pan1, pan2)).result
      .current;

    configureRelations(composedGesture);

    expect(pan1.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan2.tag,
    ]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.tag,
    ]);
  });

  test('useExclusive', () => {
    const composedGesture = renderHook(() => useExclusive(pan2, pan1)).result
      .current;

    configureRelations(composedGesture);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([pan2.tag]);
    expect(pan2.gestureRelations.waitFor).toStrictEqual([]);
  });

  test('useRace', () => {
    const composedGesture = renderHook(() => useRace(pan1, pan2)).result
      .current;

    configureRelations(composedGesture);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);
    expect(pan1.gestureRelations.blocksHandlers).toStrictEqual([]);
    expect(pan1.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(pan2.gestureRelations.waitFor).toStrictEqual([]);
    expect(pan2.gestureRelations.blocksHandlers).toStrictEqual([]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([]);
  });
});

describe('External relations', () => {
  test('simultaneousWithExternalGesture', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: pan1,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: [pan1, pan2],
      })
    ).result.current;

    configureRelations(pan1);
    configureRelations(pan2);
    configureRelations(pan3);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.tag, pan3.tag].sort()
    );
    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan3.tag].sort()
    );
    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan2.tag].sort()
    );
  });

  test('requireExternalGestureToFail', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireExternalGestureToFail: pan1,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireExternalGestureToFail: [pan1, pan2],
      })
    ).result.current;

    configureRelations(pan1);
    configureRelations(pan2);
    configureRelations(pan3);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);
    expect(pan2.gestureRelations.waitFor).toStrictEqual([pan1.tag]);
    expect(pan3.gestureRelations.waitFor).toStrictEqual([pan1.tag, pan2.tag]);
  });

  test('blocksExternalGesture', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        blocksExternalGesture: pan1,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        blocksExternalGesture: [pan1, pan2],
      })
    ).result.current;

    configureRelations(pan1);
    configureRelations(pan2);
    configureRelations(pan3);

    expect(pan1.gestureRelations.blocksHandlers).toStrictEqual([]);
    expect(pan2.gestureRelations.blocksHandlers).toStrictEqual([pan1.tag]);
    expect(pan3.gestureRelations.blocksHandlers).toStrictEqual([
      pan1.tag,
      pan2.tag,
    ]);
  });
});

describe('Complex relations', () => {
  let pan1: SingleGesture<unknown, unknown>,
    pan2: SingleGesture<unknown, unknown>,
    pan3: SingleGesture<unknown, unknown>;
  let tap1: SingleGesture<unknown, unknown>,
    tap2: SingleGesture<unknown, unknown>,
    tap3: SingleGesture<unknown, unknown>;

  beforeEach(() => {
    tap1 = renderHook(() =>
      useGesture(SingleGestureName.Tap, { disableReanimated: true })
    ).result.current;
    tap2 = renderHook(() =>
      useGesture(SingleGestureName.Tap, { disableReanimated: true })
    ).result.current;
    tap3 = renderHook(() =>
      useGesture(SingleGestureName.Tap, { disableReanimated: true })
    ).result.current;

    pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
  });

  // Test case from description of https://github.com/software-mansion/react-native-gesture-handler/pull/3693
  test('Case 1', () => {
    const E2 = renderHook(() => useExclusive(tap1, tap2)).result.current;
    const S1 = renderHook(() => useSimultaneous(E2, pan1)).result.current;
    const S2 = renderHook(() => useSimultaneous(pan2, pan3)).result.current;
    const E1 = renderHook(() => useExclusive(S1, S2)).result.current;

    configureRelations(E1);

    expect(tap1.gestureRelations.waitFor).toStrictEqual([]);
    expect(tap1.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.tag,
    ]);

    expect(tap2.gestureRelations.waitFor).toStrictEqual([tap1.tag]);
    expect(tap2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.tag,
    ]);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);
    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [tap1.tag, tap2.tag].sort()
    );

    expect(pan2.gestureRelations.waitFor).toStrictEqual([
      tap1.tag,
      tap2.tag,
      pan1.tag,
    ]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan3.tag,
    ]);

    expect(pan3.gestureRelations.waitFor).toStrictEqual([
      tap1.tag,
      tap2.tag,
      pan1.tag,
    ]);
    expect(pan3.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan2.tag,
    ]);
  });

  test('Case 2', () => {
    const simultaneous = renderHook(() => useSimultaneous(pan1, pan2)).result
      .current;
    const exclusive = renderHook(() => useExclusive(tap1, simultaneous)).result
      .current;

    configureRelations(exclusive);

    expect(tap1.gestureRelations.waitFor).toStrictEqual([]);
    expect(tap1.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([tap1.tag]);
    expect(pan1.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan2.tag,
    ]);

    expect(pan2.gestureRelations.waitFor).toStrictEqual([tap1.tag]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.tag,
    ]);
  });

  test('Case 3', () => {
    const exclusive = renderHook(() => useExclusive(tap1, tap2, tap3)).result
      .current;

    configureRelations(exclusive);

    expect(tap1.gestureRelations.waitFor).toStrictEqual([]);
    expect(tap1.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(tap2.gestureRelations.waitFor).toStrictEqual([tap1.tag]);
    expect(tap2.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(tap3.gestureRelations.waitFor).toStrictEqual([tap1.tag, tap2.tag]);
    expect(tap3.gestureRelations.simultaneousHandlers).toStrictEqual([]);
  });
});

describe('Complex relations with external gestures', () => {
  test('Case 1', () => {
    const pan5 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: pan5,
      })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: pan5,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireExternalGestureToFail: pan5,
      })
    ).result.current;
    const pan4 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireExternalGestureToFail: pan5,
      })
    ).result.current;

    const S1 = renderHook(() => useSimultaneous(pan1, pan2)).result.current;
    const S2 = renderHook(() => useSimultaneous(pan3, pan4)).result.current;
    const E = renderHook(() => useExclusive(S1, S2)).result.current;

    configureRelations(pan5);
    configureRelations(E);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.tag, pan5.tag].sort()
    );
    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan5.tag].sort()
    );
    expect(pan2.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan3.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan4.tag,
    ]);
    expect(pan3.gestureRelations.waitFor).toStrictEqual([
      pan5.tag,
      pan1.tag,
      pan2.tag,
    ]);

    expect(pan4.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan3.tag,
    ]);
    expect(pan4.gestureRelations.waitFor).toStrictEqual([
      pan5.tag,
      pan1.tag,
      pan2.tag,
    ]);

    expect(pan5.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan2.tag].sort()
    );
  });

  test('Case 2', () => {
    const pan4 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const pan5 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: [pan4, pan5],
      })
    ).result.current;

    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireExternalGestureToFail: [pan4, pan5],
      })
    ).result.current;

    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const E = renderHook(() => useExclusive(pan1, pan2)).result.current;
    const S = renderHook(() => useSimultaneous(E, pan3)).result.current;

    configureRelations(pan4);
    configureRelations(pan5);
    configureRelations(S);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan4.tag, pan5.tag, pan3.tag].sort()
    );
    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan3.tag,
    ]);
    expect(pan2.gestureRelations.waitFor).toStrictEqual([
      pan4.tag,
      pan5.tag,
      pan1.tag,
    ]);

    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan2.tag].sort()
    );
    expect(pan3.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan4.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.tag,
    ]);
    expect(pan4.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan5.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.tag,
    ]);
    expect(pan5.gestureRelations.waitFor).toStrictEqual([]);
  });
});

describe('External relations with composed gestures', () => {
  test('Case 1', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const composedGesture = renderHook(() => useSimultaneous(pan1, pan2)).result
      .current;

    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: composedGesture,
      })
    ).result.current;

    configureRelations(composedGesture);
    configureRelations(pan3);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.tag, pan3.tag].sort()
    );
    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan3.tag].sort()
    );
    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan2.tag].sort()
    );
  });

  test('Case 1 - reversed order of configuring relations', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const composedGesture = renderHook(() => useSimultaneous(pan1, pan2)).result
      .current;

    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWithExternalGesture: composedGesture,
      })
    ).result.current;

    configureRelations(pan3);
    configureRelations(composedGesture);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.tag, pan3.tag].sort()
    );
    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan3.tag].sort()
    );
    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.tag, pan2.tag].sort()
    );
  });
});
