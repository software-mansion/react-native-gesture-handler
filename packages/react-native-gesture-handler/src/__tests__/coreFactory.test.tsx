import type { GestureHandlerPlatformPort } from '@swmansion/gesture-handler-core';
import { createGestureHandlerAPI } from '@swmansion/gesture-handler-core';
import { findGesture } from '@swmansion/gesture-handler-core/src/handlers/handlersRegistry';
import { renderHook } from '@testing-library/react-native';
import * as React from 'react';

import type { TapGestureConfig } from '../index';

// Seed of the platform conformance kit: two factory instances with separate
// fake ports must (a) route handler operations to their own port only and
// (b) share core's module-scope singletons (handler-tag counter, registry) so
// tags stay globally unique — the coexistence guarantee for e.g. an RNW app
// with both the native and the web binding installed.

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
    press: {
      Button: HostGestureDetector,
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

describe('createGestureHandlerAPI with two platform ports', () => {
  test('routes handler operations to the owning port only', () => {
    const portA = createFakePort();
    const portB = createFakePort();
    const apiA = createGestureHandlerAPI(portA);
    const apiB = createGestureHandlerAPI(portB);

    const a = renderHook(() => apiA.useTapGesture({}));
    const b = renderHook(() => apiB.usePanGesture({}));

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

  test('shares the handler tag namespace and registry across factories', () => {
    const apiA = createGestureHandlerAPI(createFakePort());
    const apiB = createGestureHandlerAPI(createFakePort());

    const configA: TapGestureConfig = { testID: 'from-port-a' };
    const configB: TapGestureConfig = { testID: 'from-port-b' };

    const a = renderHook(() => apiA.useTapGesture(configA));
    const b = renderHook(() => apiB.useTapGesture(configB));

    const tagA = a.result.current.handlerTag;
    const tagB = b.result.current.handlerTag;

    // One counter in core: tags never collide across factory instances.
    expect(tagA).not.toBe(tagB);

    // One registry in core: both gestures are findable through the same maps
    // (this is what jest-utils' getByGestureTestId relies on).
    expect(findGesture(tagA)?.config.testID).toBe('from-port-a');
    expect(findGesture(tagB)?.config.testID).toBe('from-port-b');

    a.unmount();
    b.unmount();
  });

  test('rejects a structurally incomplete port in __DEV__', () => {
    const broken = createFakePort();
    // @ts-expect-error deliberately breaking the contract
    delete broken.proxy.flush;

    expect(() => createGestureHandlerAPI(broken)).toThrow(
      /platform port is missing proxy\.flush/
    );
  });
});
