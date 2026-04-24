import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useLongPressGesture,
  usePinchGesture,
  useTapGesture,
  useCompetingGestures,
  GestureDetector,
  useSimultaneousGestures,
  usePanGesture,
  useExclusiveGestures,
} from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import AnimatedCameraView from '../../../common_assets/AnimatedCameraView/AnimatedCameraView';
import { COLORS } from '../../../common';
import { FilterCarousel, FilterOverlay } from './filters';
import { CaptureButton } from './capture';

const FILTERS = [
  COLORS.RED,
  COLORS.GREEN,
  COLORS.NAVY,
  COLORS.YELLOW,
  COLORS.KINDA_BLUE,
];
const CAROUSEL_SIZE = 100;
const FILTER_SIZE = 60;
const VIDEO_DURATION = 20000;

export default function Camera() {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const selectedFilter = useSharedValue(0);
  const captureProgress = useSharedValue(0);
  const zoom = useSharedValue(1);

  const filterChangeGesture = usePanGesture({
    onUpdate: (e) => {
      selectedFilter.value -= e.changeX / FILTER_SIZE;
    },
    onDeactivate: () => {
      const nextFilter = Math.min(
        FILTERS.length - 1,
        Math.max(0, Math.round(selectedFilter.value))
      );
      selectedFilter.value = withTiming(nextFilter, { duration: 150 });
    },
  });

  function takePhoto() {
    alert("I didn't bother to implement this :)");
  }

  function startRecording() {
    // no-op
  }

  function stopRecording() {
    alert("I didn't bother to implement this either :)");
  }

  const takePhotoGesture = useTapGesture({
    onDeactivate: () => {
      runOnJS(takePhoto)();
      captureProgress.value = withTiming(0, { duration: 1000 });
    },
  });

  const takeVideoGesture = useLongPressGesture({
    shouldCancelWhenOutside: false,
    maxDistance: 10000,
    onActivate: () => {
      runOnJS(startRecording)();
      captureProgress.value = withTiming(1, {
        duration: VIDEO_DURATION,
        easing: (x) => x,
      });
    },
    onDeactivate: () => {
      runOnJS(stopRecording)();
      captureProgress.value = 0;
    },
  });

  const panZoomGesture = usePanGesture({
    shouldCancelWhenOutside: false,
    requireToFail: filterChangeGesture,
    onUpdate: (e) => {
      zoom.value = Math.max(1, Math.min(2, zoom.value - e.changeY / 500));
    },
  });

  const pinchZoomGesture = usePinchGesture({
    onUpdate: (e) => {
      zoom.value = Math.max(
        1,
        Math.min(2, zoom.value * ((e.scaleChange - 1) * 0.2 + 1))
      );
    },
  });

  const changeCameraGesture = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: () => {
      setFacing((f) => (f === 'back' ? 'front' : 'back'));
    },
    disableReanimated: true,
  });

  const competingGesture = useCompetingGestures(
    pinchZoomGesture,
    changeCameraGesture
  );
  const simultanousGesture = useSimultaneousGestures(
    panZoomGesture,
    takeVideoGesture
  );
  const exclusiveGesture = useExclusiveGestures(
    simultanousGesture,
    takePhotoGesture
  );
  return (
    <GestureDetector gesture={competingGesture}>
      <View style={styles.container}>
        <AnimatedCameraView facing={facing} zoom={zoom} />
        <FilterOverlay filters={FILTERS} selected={selectedFilter} />
        <GestureDetector gesture={filterChangeGesture}>
          <View style={styles.carouselContainer}>
            <FilterCarousel
              filters={FILTERS}
              selected={selectedFilter}
              filterSize={FILTER_SIZE}
            />
            <GestureDetector gesture={exclusiveGesture}>
              <CaptureButton progress={captureProgress} />
            </GestureDetector>
          </View>
        </GestureDetector>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    position: 'absolute',
    left: 0,
    bottom: 32,
    height: CAROUSEL_SIZE,
    width: '100%',
    justifyContent: 'center',
  },
});
