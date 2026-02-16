import { tagMessage } from '../utils';
import {
  useExclusiveGestures,
  useCompetingGestures,
  useSimultaneousGestures,
} from '../v3/hooks/composition';
import { useGesture } from '../v3/hooks/useGesture';
import { configureRelations } from '../v3/detectors/utils';
import { SingleGesture, SingleGestureName } from '../v3/types';
import { renderHook } from '@testing-library/react-native';

describe('Ensure only one leaf node', () => {
  let pan1: SingleGesture<unknown, unknown, unknown>,
    pan2: SingleGesture<unknown, unknown, unknown>,
    pan3: SingleGesture<unknown, unknown, unknown>;

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
    expect(() => useSimultaneousGestures(pan1, pan1)).toThrow(errorMessage);
  });

  test('useExclusive', () => {
    expect(() => useExclusiveGestures(pan1, pan1)).toThrow(errorMessage);
  });

  test('useRace', () => {
    expect(() => useCompetingGestures(pan1, pan1)).toThrow(errorMessage);
  });

  test('Complex composition', () => {
    const exclusive1 = renderHook(() => useExclusiveGestures(pan1, pan2)).result
      .current;
    const exclusive2 = renderHook(() => useExclusiveGestures(pan1, pan3)).result
      .current;

    expect(() => useSimultaneousGestures(exclusive1, exclusive2)).toThrow(
      errorMessage
    );
  });
});

describe('Simple relations', () => {
  let pan1: SingleGesture<unknown, unknown, unknown>,
    pan2: SingleGesture<unknown, unknown, unknown>;

  beforeEach(() => {
    pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
  });

  test('useSimultaneous', () => {
    const composedGesture = renderHook(() =>
      useSimultaneousGestures(pan1, pan2)
    ).result.current;

    configureRelations(composedGesture);

    expect(pan1.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan2.handlerTag,
    ]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.handlerTag,
    ]);
  });

  test('useExclusive', () => {
    const composedGesture = renderHook(() => useExclusiveGestures(pan2, pan1))
      .result.current;

    configureRelations(composedGesture);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([pan2.handlerTag]);
    expect(pan2.gestureRelations.waitFor).toStrictEqual([]);
  });

  test('useRace', () => {
    const composedGesture = renderHook(() => useCompetingGestures(pan1, pan2))
      .result.current;

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
  test('simultaneousWith', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWith: pan1,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWith: [pan1, pan2],
      })
    ).result.current;

    configureRelations(pan1);
    configureRelations(pan2);
    configureRelations(pan3);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan2.handlerTag].sort()
    );
  });

  test('requireToFail', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireToFail: pan1,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireToFail: [pan1, pan2],
      })
    ).result.current;

    configureRelations(pan1);
    configureRelations(pan2);
    configureRelations(pan3);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);
    expect(pan2.gestureRelations.waitFor).toStrictEqual([pan1.handlerTag]);
    expect(pan3.gestureRelations.waitFor).toStrictEqual([
      pan1.handlerTag,
      pan2.handlerTag,
    ]);
  });

  test('blocks', () => {
    const pan1 = renderHook(() =>
      useGesture(SingleGestureName.Pan, { disableReanimated: true })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        block: pan1,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        block: [pan1, pan2],
      })
    ).result.current;

    configureRelations(pan1);
    configureRelations(pan2);
    configureRelations(pan3);

    expect(pan1.gestureRelations.blocksHandlers).toStrictEqual([]);
    expect(pan2.gestureRelations.blocksHandlers).toStrictEqual([
      pan1.handlerTag,
    ]);
    expect(pan3.gestureRelations.blocksHandlers).toStrictEqual([
      pan1.handlerTag,
      pan2.handlerTag,
    ]);
  });
});

describe('Complex relations', () => {
  let pan1: SingleGesture<unknown, unknown, unknown>,
    pan2: SingleGesture<unknown, unknown, unknown>,
    pan3: SingleGesture<unknown, unknown, unknown>;
  let tap1: SingleGesture<unknown, unknown, unknown>,
    tap2: SingleGesture<unknown, unknown, unknown>,
    tap3: SingleGesture<unknown, unknown, unknown>;

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
    const E2 = renderHook(() => useExclusiveGestures(tap1, tap2)).result
      .current;
    const S1 = renderHook(() => useSimultaneousGestures(E2, pan1)).result
      .current;
    const S2 = renderHook(() => useSimultaneousGestures(pan2, pan3)).result
      .current;
    const E1 = renderHook(() => useExclusiveGestures(S1, S2)).result.current;

    configureRelations(E1);

    expect(tap1.gestureRelations.waitFor).toStrictEqual([]);
    expect(tap1.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.handlerTag,
    ]);

    expect(tap2.gestureRelations.waitFor).toStrictEqual([tap1.handlerTag]);
    expect(tap2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.handlerTag,
    ]);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);
    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [tap1.handlerTag, tap2.handlerTag].sort()
    );

    expect(pan2.gestureRelations.waitFor).toStrictEqual([
      tap1.handlerTag,
      tap2.handlerTag,
      pan1.handlerTag,
    ]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan3.handlerTag,
    ]);

    expect(pan3.gestureRelations.waitFor).toStrictEqual([
      tap1.handlerTag,
      tap2.handlerTag,
      pan1.handlerTag,
    ]);
    expect(pan3.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan2.handlerTag,
    ]);
  });

  test('Case 2', () => {
    const simultaneous = renderHook(() => useSimultaneousGestures(pan1, pan2))
      .result.current;
    const exclusive = renderHook(() => useExclusiveGestures(tap1, simultaneous))
      .result.current;

    configureRelations(exclusive);

    expect(tap1.gestureRelations.waitFor).toStrictEqual([]);
    expect(tap1.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(pan1.gestureRelations.waitFor).toStrictEqual([tap1.handlerTag]);
    expect(pan1.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan2.handlerTag,
    ]);

    expect(pan2.gestureRelations.waitFor).toStrictEqual([tap1.handlerTag]);
    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.handlerTag,
    ]);
  });

  test('Case 3', () => {
    const exclusive = renderHook(() => useExclusiveGestures(tap1, tap2, tap3))
      .result.current;

    configureRelations(exclusive);

    expect(tap1.gestureRelations.waitFor).toStrictEqual([]);
    expect(tap1.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(tap2.gestureRelations.waitFor).toStrictEqual([tap1.handlerTag]);
    expect(tap2.gestureRelations.simultaneousHandlers).toStrictEqual([]);

    expect(tap3.gestureRelations.waitFor).toStrictEqual([
      tap1.handlerTag,
      tap2.handlerTag,
    ]);
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
        simultaneousWith: pan5,
      })
    ).result.current;
    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWith: pan5,
      })
    ).result.current;
    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireToFail: pan5,
      })
    ).result.current;
    const pan4 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireToFail: pan5,
      })
    ).result.current;

    const S1 = renderHook(() => useSimultaneousGestures(pan1, pan2)).result
      .current;
    const S2 = renderHook(() => useSimultaneousGestures(pan3, pan4)).result
      .current;
    const E = renderHook(() => useExclusiveGestures(S1, S2)).result.current;

    configureRelations(pan5);
    configureRelations(E);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.handlerTag, pan5.handlerTag].sort()
    );
    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan5.handlerTag].sort()
    );
    expect(pan2.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan3.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan4.handlerTag,
    ]);
    expect(pan3.gestureRelations.waitFor).toStrictEqual([
      pan5.handlerTag,
      pan1.handlerTag,
      pan2.handlerTag,
    ]);

    expect(pan4.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan3.handlerTag,
    ]);
    expect(pan4.gestureRelations.waitFor).toStrictEqual([
      pan5.handlerTag,
      pan1.handlerTag,
      pan2.handlerTag,
    ]);

    expect(pan5.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan2.handlerTag].sort()
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
        simultaneousWith: [pan4, pan5],
      })
    ).result.current;

    const pan2 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        requireToFail: [pan4, pan5],
      })
    ).result.current;

    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
      })
    ).result.current;

    const E = renderHook(() => useExclusiveGestures(pan1, pan2)).result.current;
    const S = renderHook(() => useSimultaneousGestures(E, pan3)).result.current;

    configureRelations(pan4);
    configureRelations(pan5);
    configureRelations(S);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan4.handlerTag, pan5.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan1.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan2.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan3.handlerTag,
    ]);
    expect(pan2.gestureRelations.waitFor).toStrictEqual([
      pan4.handlerTag,
      pan5.handlerTag,
      pan1.handlerTag,
    ]);

    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan2.handlerTag].sort()
    );
    expect(pan3.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan4.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.handlerTag,
    ]);
    expect(pan4.gestureRelations.waitFor).toStrictEqual([]);

    expect(pan5.gestureRelations.simultaneousHandlers).toStrictEqual([
      pan1.handlerTag,
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

    const composedGesture = renderHook(() =>
      useSimultaneousGestures(pan1, pan2)
    ).result.current;

    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWith: composedGesture,
      })
    ).result.current;

    configureRelations(composedGesture);
    configureRelations(pan3);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan2.handlerTag].sort()
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

    const composedGesture = renderHook(() =>
      useSimultaneousGestures(pan1, pan2)
    ).result.current;

    const pan3 = renderHook(() =>
      useGesture(SingleGestureName.Pan, {
        disableReanimated: true,
        simultaneousWith: composedGesture,
      })
    ).result.current;

    configureRelations(pan3);
    configureRelations(composedGesture);

    expect(pan1.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan2.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan2.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan3.handlerTag].sort()
    );
    expect(pan3.gestureRelations.simultaneousHandlers.sort()).toStrictEqual(
      [pan1.handlerTag, pan2.handlerTag].sort()
    );
  });
});
