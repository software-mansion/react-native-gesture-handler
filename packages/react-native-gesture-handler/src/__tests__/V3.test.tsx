import React, { useRef } from 'react';
import { render, cleanup } from '@testing-library/react-native';
import {
  GestureHandlerRootView,
  InterceptingGestureDetector,
  usePanGesture,
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
      const tap = usePanGesture({ useAnimated: true });
      const ref = useRef(null);
      return (
        <GestureHandlerRootView>
          <InterceptingGestureDetector>
            <VirtualDetector gesture={tap}>
              <View ref={ref} />
            </VirtualDetector>
          </InterceptingGestureDetector>
        </GestureHandlerRootView>
      );
    }
    expect(() => render(<VirtualDetectorAnimated />)).toThrow(
      '[react-native-gesture-handler] VirtualGestureDetector cannot handle Animated events with native driver when used inside InterceptingGestureDetector. Use Reanimated or Animated events without native driver instead.'
    );
  });
});
