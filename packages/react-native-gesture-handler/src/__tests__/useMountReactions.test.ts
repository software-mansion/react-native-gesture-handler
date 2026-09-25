import { renderHook } from '@testing-library/react-native';
import type { Platform as PlatformModule } from 'react-native';

import type { AttachedGestureState } from '../handlers/gestures/GestureDetector/types';
import { useMountReactions } from '../handlers/gestures/GestureDetector/useMountReactions';
import { MountRegistry } from '../mountRegistry';

// The relation scan used to resolve entries through `transformIntoHandlerTags`,
// whose web branch returns handler objects while the caller compares numeric
// tags — so on web a late-mounted relation could never match. Run these on web
// to cover that branch.
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const actual = jest.requireActual<{ default: typeof PlatformModule }>(
    'react-native/Libraries/Utilities/Platform'
  ).default;
  return {
    __esModule: true,
    default: {
      ...actual,
      OS: 'web',
      select: (spec: Record<string, unknown>) =>
        'web' in spec ? spec.web : (spec.native ?? spec.default),
    },
  };
});

type RelationKey = 'blocksHandlers' | 'requireToFail' | 'simultaneousWith';

const stateWithRelation = (
  key: RelationKey,
  relation: unknown[]
): AttachedGestureState =>
  ({
    attachedGestures: [{ config: { [key]: relation } }],
    animatedEventHandler: null,
    animatedHandlers: null,
    shouldUseReanimated: false,
    isMounted: true,
  }) as unknown as AttachedGestureState;

const mount = (handlerTag: number) =>
  MountRegistry.gestureHandlerWillMount({
    handlerTag,
  } as unknown as React.Component);

describe('useMountReactions', () => {
  const relationKeys: RelationKey[] = [
    'blocksHandlers',
    'requireToFail',
    'simultaneousWith',
  ];

  test.each(relationKeys)(
    'updates the detector when a ref in %s resolves on mount',
    (key) => {
      const updateDetector = jest.fn();
      const ref = { current: { handlerTag: 42 } };
      const { unmount } = renderHook(() =>
        useMountReactions(updateDetector, stateWithRelation(key, [ref]))
      );

      mount(42);

      expect(updateDetector).toHaveBeenCalledTimes(1);
      unmount();
    }
  );

  test('leaves the detector alone when an unrelated gesture mounts', () => {
    const updateDetector = jest.fn();
    const ref = { current: { handlerTag: 42 } };
    const { unmount } = renderHook(() =>
      useMountReactions(
        updateDetector,
        stateWithRelation('simultaneousWith', [ref])
      )
    );

    mount(7);

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });

  test('leaves the detector alone for a ref that has not resolved yet', () => {
    const updateDetector = jest.fn();
    const { unmount } = renderHook(() =>
      useMountReactions(
        updateDetector,
        stateWithRelation('simultaneousWith', [{ current: null }])
      )
    );

    mount(42);

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });

  test('ignores entries that already carried their tag when the detector attached', () => {
    const updateDetector = jest.fn();
    // A gesture object and a raw tag are both resolved by the time the detector
    // attaches, so mounting cannot change what they point at.
    const { unmount } = renderHook(() =>
      useMountReactions(
        updateDetector,
        stateWithRelation('simultaneousWith', [{ handlerTag: 42 }, 42])
      )
    );

    mount(42);

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });

  test('does not update a detector that is already unmounted', () => {
    const updateDetector = jest.fn();
    const state = stateWithRelation('simultaneousWith', [
      { current: { handlerTag: 42 } },
    ]);
    state.isMounted = false;
    const { unmount } = renderHook(() =>
      useMountReactions(updateDetector, state)
    );

    mount(42);

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });
});
