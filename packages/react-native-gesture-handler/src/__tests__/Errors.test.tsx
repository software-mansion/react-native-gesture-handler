import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  InterceptingGestureDetector,
  useTapGesture,
} from '../index';
import { findNodeHandle, View } from 'react-native';
import { VirtualDetector } from '../v3/detectors/VirtualDetector/VirtualDetector';

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
