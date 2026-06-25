import { cleanup, render } from '@testing-library/react-native';
import React from 'react';
import { findNodeHandle, View } from 'react-native';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  InterceptingGestureDetector,
  useTapGesture,
} from '../index';
import { VirtualDetector } from '../v3/detectors/VirtualDetector/VirtualDetector';

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock')
);

beforeEach(() => cleanup());
jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  findNodeHandle: jest.fn(),
}));

describe('VirtualDetector', () => {
  test('virtual detector must be under InterceptingGestureDetector', () => {
    function VirtualDetectorWithNoBoundary() {
      const tap = useTapGesture({});
      return (
        <GestureHandlerRootView>
          <VirtualDetector gesture={tap}>
            <View />
          </VirtualDetector>
        </GestureHandlerRootView>
      );
    }

    expect(() => render(<VirtualDetectorWithNoBoundary />)).toThrow(
      'VirtualGestureDetector must be a descendant of an InterceptingGestureDetector'
    );
  });
  test('virtual detector does not handle animated events', () => {
    (findNodeHandle as jest.Mock).mockReturnValue(123);

    function VirtualDetectorAnimated() {
      const tap = useTapGesture({ useAnimated: true });
      return (
        <GestureHandlerRootView>
          <InterceptingGestureDetector>
            <VirtualDetector gesture={tap}>
              <View />
            </VirtualDetector>
          </InterceptingGestureDetector>
        </GestureHandlerRootView>
      );
    }

    expect(() => render(<VirtualDetectorAnimated />)).toThrow(
      'VirtualGestureDetector cannot handle Animated events with native driver when used inside InterceptingGestureDetector. Use Reanimated or Animated events without native driver instead.'
    );
  });

  test('intercepting detector cant handle multiple types of events', () => {
    (findNodeHandle as jest.Mock).mockReturnValue(123);
    const mockWorklet = () => undefined;
    mockWorklet.__workletHash = 123;

    function InterceptingDetectorMultipleTypes() {
      const tap = useTapGesture({ useAnimated: true });
      const tap2 = useTapGesture({ onActivate: mockWorklet });
      return (
        <GestureHandlerRootView>
          <InterceptingGestureDetector gesture={tap}>
            <VirtualDetector gesture={tap2}>
              <View />
            </VirtualDetector>
          </InterceptingGestureDetector>
        </GestureHandlerRootView>
      );
    }

    expect(() => render(<InterceptingDetectorMultipleTypes />)).toThrow(
      'InterceptingGestureDetector can only handle either Reanimated or Animated events.'
    );
  });
});

describe('Sharing a gesture across detectors', () => {
  beforeEach(() => (findNodeHandle as jest.Mock).mockReturnValue(123));

  test('throws when the same gesture is attached to two detectors', () => {
    function SameGestureTwoDetectors() {
      const tap = useTapGesture({});
      return (
        <GestureHandlerRootView>
          <GestureDetector gesture={tap}>
            <View />
          </GestureDetector>
          <GestureDetector gesture={tap}>
            <View />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    expect(() => render(<SameGestureTwoDetectors />)).toThrow(
      'Using the same gesture instance across multiple GestureDetectors is not possible. Create a separate gesture for each detector.'
    );
  });

  test('does not throw when the same gesture is reattached to another detector', () => {
    // Changing the key unmounts the previous detector and mounts a new one with
    // the same gesture - the old detector must release the gesture before the
    // new one claims it.
    function ReattachedGesture({ detectorKey }: { detectorKey: string }) {
      const tap = useTapGesture({});
      return (
        <GestureHandlerRootView>
          <GestureDetector key={detectorKey} gesture={tap}>
            <View />
          </GestureDetector>
        </GestureHandlerRootView>
      );
    }

    const { rerender } = render(<ReattachedGesture detectorKey="a" />);
    expect(() => rerender(<ReattachedGesture detectorKey="b" />)).not.toThrow();
  });

  test('throws when the same gesture is attached to two virtual detectors', () => {
    function SameGestureTwoVirtualDetectors() {
      const tap = useTapGesture({});
      return (
        <GestureHandlerRootView>
          <InterceptingGestureDetector>
            <VirtualDetector gesture={tap}>
              <View />
            </VirtualDetector>
            <VirtualDetector gesture={tap}>
              <View />
            </VirtualDetector>
          </InterceptingGestureDetector>
        </GestureHandlerRootView>
      );
    }

    expect(() => render(<SameGestureTwoVirtualDetectors />)).toThrow(
      'Using the same gesture instance across multiple GestureDetectors is not possible. Create a separate gesture for each detector.'
    );
  });
});

describe('Check if descendant of root view', () => {
  test('gesture detector', () => {
    function GestureDetectorNoRootView() {
      const tap = useTapGesture({});
      return (
        <GestureDetector gesture={tap}>
          <View />
        </GestureDetector>
      );
    }
    expect(() => render(<GestureDetectorNoRootView />)).toThrow(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  });

  test('intercepting detector', () => {
    function GestureDetectorNoRootView() {
      const tap = useTapGesture({});
      return (
        <InterceptingGestureDetector gesture={tap}>
          <View />
        </InterceptingGestureDetector>
      );
    }

    expect(() => render(<GestureDetectorNoRootView />)).toThrow(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  });

  test('legacy detector', () => {
    function GestureDetectorNoRootView() {
      const tap = Gesture.Tap();
      return (
        <GestureDetector gesture={tap}>
          <View />
        </GestureDetector>
      );
    }

    expect(() => render(<GestureDetectorNoRootView />)).toThrow(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  });
});
