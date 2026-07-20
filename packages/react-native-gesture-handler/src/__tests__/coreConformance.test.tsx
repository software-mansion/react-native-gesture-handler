import type {
  CoreRuntime,
  GestureHandlerPlatformPort,
} from '@swmansion/gesture-handler-core';
import { validatePort } from '@swmansion/gesture-handler-core';
import { findGesture } from '@swmansion/gesture-handler-core/src/handlers/handlersRegistry';
import { usePanGesture } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pan/usePanGesture';
import { useTapGesture } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/tap/useTapGesture';
import { renderHook } from '@testing-library/react-native';
import * as React from 'react';

// Seed of the platform conformance kit: two runtimes built over separate
// fake ports must (a) route handler operations to their own port only and
// (b) share core's module-scope singletons (handler-tag counter, registry)
// so tags stay globally unique — the coexistence guarantee for e.g. an RNW
// app with both the native and the web binding installed. The impls are
// exercised the way bindings actually consume them: called directly with a
// runtime, one bound module per export.

function createFakePort() {
  const HostGestureDetector = (props: { children?: React.ReactNode }) => (
    <>{props.children}</>
  );

  const port: GestureHandlerPlatformPort = {
    proxy: {
      createGestureHandler: jest.fn(),
      setGestureHandlerConfig: jest.fn(),
      updateGestureHandlerConfig: jest.fn(),
      dropGestureHandler: jest.fn(),
      configureRelations: jest.fn(),
      flush: jest.fn(),
    },
    detector: {
      HostGestureDetector,
      AnimatedHostGestureDetector: HostGestureDetector,
      ReanimatedHostGestureDetector: undefined,
      detectorStyle: {},
      Wrap: HostGestureDetector,
      getViewTag: (node: unknown) => node,
      useNativeGestureRole: () => {
        // no-op
      },
    },
    capabilities: {
      requiresRootView: false,
      fansOutReanimatedHandlers: false,
      virtualChildrenCarryViewRefs: false,
    },
    reanimated: undefined,
  };

  return port;
}

function createFakeRuntime(port: GestureHandlerPlatformPort): CoreRuntime {
  validatePort(port);
  return { port, lastUpdateEventMap: undefined };
}

describe('core impls bound to two platform runtimes', () => {
  test('route handler operations to the owning port only', () => {
    const portA = createFakePort();
    const portB = createFakePort();
    const runtimeA = createFakeRuntime(portA);
    const runtimeB = createFakeRuntime(portB);

    const a = renderHook(() => useTapGesture(runtimeA, {}));
    const b = renderHook(() => usePanGesture(runtimeB, {}));

    expect(portA.proxy.createGestureHandler).toHaveBeenCalledTimes(1);
    expect(portB.proxy.createGestureHandler).toHaveBeenCalledTimes(1);
    expect(portA.proxy.createGestureHandler).toHaveBeenCalledWith(
      'TapGestureHandler',
      a.result.current.handlerTag,
      {}
    );
    expect(portB.proxy.createGestureHandler).toHaveBeenCalledWith(
      'PanGestureHandler',
      b.result.current.handlerTag,
      {}
    );

    a.unmount();
    b.unmount();

    expect(portA.proxy.dropGestureHandler).toHaveBeenCalledWith(
      a.result.current.handlerTag
    );
    expect(portB.proxy.dropGestureHandler).toHaveBeenCalledWith(
      b.result.current.handlerTag
    );
    // No cross-talk in either direction.
    expect(portA.proxy.dropGestureHandler).toHaveBeenCalledTimes(1);
    expect(portB.proxy.dropGestureHandler).toHaveBeenCalledTimes(1);
  });

  test('share the handler tag namespace and registry across runtimes', () => {
    const runtimeA = createFakeRuntime(createFakePort());
    const runtimeB = createFakeRuntime(createFakePort());

    const a = renderHook(() =>
      useTapGesture(runtimeA, { testID: 'from-port-a' })
    );
    const b = renderHook(() =>
      useTapGesture(runtimeB, { testID: 'from-port-b' })
    );

    const tagA = a.result.current.handlerTag;
    const tagB = b.result.current.handlerTag;

    // One counter in core: tags never collide across runtimes.
    expect(tagA).not.toBe(tagB);

    // One registry in core: both gestures are findable through the same maps
    // (this is what jest-utils' getByGestureTestId relies on).
    expect(findGesture(tagA)?.config.testID).toBe('from-port-a');
    expect(findGesture(tagB)?.config.testID).toBe('from-port-b');

    a.unmount();
    b.unmount();
  });

  test('validatePort rejects a structurally incomplete port in __DEV__', () => {
    const broken = createFakePort();
    // @ts-expect-error deliberately breaking the contract
    delete broken.proxy.flush;

    expect(() => validatePort(broken)).toThrow(
      /platform port is missing proxy\.flush/
    );
  });
});
