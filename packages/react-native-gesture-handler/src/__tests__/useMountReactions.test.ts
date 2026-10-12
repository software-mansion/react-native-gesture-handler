import { renderHook } from '@testing-library/react-native';
import type { Platform as PlatformModule } from 'react-native';

import type { GestureType } from '../handlers/gestures/gesture';
import { BaseGesture } from '../handlers/gestures/gesture';
import type { AttachedGestureState } from '../handlers/gestures/GestureDetector/types';
import { useMountReactions } from '../handlers/gestures/GestureDetector/useMountReactions';
import { hasExternalRelations } from '../handlers/gestures/GestureDetector/utils';
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
    hasExternalRelations: true,
  }) as unknown as AttachedGestureState;

const mount = (handlerTag: number) =>
  MountRegistry.gestureHandlerWillMount({
    handlerTag,
  } as unknown as React.Component);

const gestureObject = (handlerTag: number, config: object = {}) => {
  const gesture = Object.create(BaseGesture.prototype) as GestureType;
  gesture.handlerTag = handlerTag;
  gesture.config = config as GestureType['config'];
  return gesture;
};

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

  test('ignores raw tags, which cannot change after the detector attached', () => {
    const updateDetector = jest.fn();
    const { unmount } = renderHook(() =>
      useMountReactions(
        updateDetector,
        stateWithRelation('simultaneousWith', [42])
      )
    );

    mount(42);

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });

  test('updates the detector when a gesture object in a relation mounts later', () => {
    const updateDetector = jest.fn();
    // The object had no tag when this detector attached; its own detector
    // assigns one in `initialize` and then fires the mount event with it.
    const external = gestureObject(-1);
    const { unmount } = renderHook(() =>
      useMountReactions(
        updateDetector,
        stateWithRelation('simultaneousWith', [external])
      )
    );

    external.handlerTag = 42;
    MountRegistry.gestureWillMount(external);

    expect(updateDetector).toHaveBeenCalledTimes(1);
    unmount();
  });

  test('does not match a different gesture object with the same tag', () => {
    const updateDetector = jest.fn();
    const { unmount } = renderHook(() =>
      useMountReactions(
        updateDetector,
        stateWithRelation('simultaneousWith', [gestureObject(42)])
      )
    );

    MountRegistry.gestureWillMount(gestureObject(42));

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });

  test('skips the mount of its own gestures', () => {
    const updateDetector = jest.fn();
    // Composition fills relations with sibling gestures, so without the guard
    // every composed detector would update itself on mount.
    const first = gestureObject(1);
    const second = gestureObject(2);
    first.config = { simultaneousWith: [second] } as GestureType['config'];
    second.config = { simultaneousWith: [first] } as GestureType['config'];
    const state = stateWithRelation('simultaneousWith', []);
    state.attachedGestures = [first, second];
    const { unmount } = renderHook(() =>
      useMountReactions(updateDetector, state)
    );

    MountRegistry.gestureWillMount(first);
    MountRegistry.gestureWillMount(second);

    expect(updateDetector).not.toHaveBeenCalled();
    unmount();
  });

  test('skips the scan when the detector has no external relations', () => {
    const updateDetector = jest.fn();
    const state = stateWithRelation('simultaneousWith', [
      { current: { handlerTag: 42 } },
    ]);
    state.hasExternalRelations = false;
    const { unmount } = renderHook(() =>
      useMountReactions(updateDetector, state)
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

describe('hasExternalRelations', () => {
  test('is false without relations or with raw tags only', () => {
    expect(hasExternalRelations([gestureObject(1)])).toBe(false);
    expect(
      hasExternalRelations([gestureObject(1, { requireToFail: [7] })])
    ).toBe(false);
  });

  test('is false when relations only point at sibling gestures', () => {
    const first = gestureObject(1);
    const second = gestureObject(2);
    first.config = { simultaneousWith: [second] } as GestureType['config'];
    second.config = { simultaneousWith: [first] } as GestureType['config'];

    expect(hasExternalRelations([first, second])).toBe(false);
  });

  test('is true for a ref', () => {
    expect(
      hasExternalRelations([
        gestureObject(1, { blocksHandlers: [{ current: null }] }),
      ])
    ).toBe(true);
  });

  test('is true for a gesture object attached by another detector', () => {
    expect(
      hasExternalRelations([
        gestureObject(1, { simultaneousWith: [gestureObject(2)] }),
      ])
    ).toBe(true);
  });
});
