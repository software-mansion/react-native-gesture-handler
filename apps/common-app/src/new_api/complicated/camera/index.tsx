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
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';
import AnimatedCameraView from '../../../common_assets/AnimatedCameraView/AnimatedCameraView';
import { COLORS } from '../../../common';

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
const RECORD_INDICATOR_STROKE = 10;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
            <FilterCarousel filters={FILTERS} selected={selectedFilter} />
            <GestureDetector gesture={exclusiveGesture}>
              <CaptureButton progress={captureProgress} />
            </GestureDetector>
          </View>
        </GestureDetector>
      </View>
    </GestureDetector>
  );
}

interface FilterCarouselProps {
  filters: string[];
  selected: SharedValue<number>;
}

function FilterCarousel(props: FilterCarouselProps) {
  const style = useAnimatedStyle(() => {
    return {
      flexDirection: 'row',
      position: 'absolute',
      left: '50%',
      gap: FILTER_SIZE * 0.4,
      transform: [
        {
          translateX:
            -FILTER_SIZE / 2 - FILTER_SIZE * 1.4 * props.selected.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      {props.filters.map((filter) => (
        <View
          key={filter}
          style={{
            backgroundColor: filter,
            width: FILTER_SIZE,
            height: FILTER_SIZE,
            borderRadius: FILTER_SIZE / 2,
          }}
        />
      ))}
    </Animated.View>
  );
}

interface FilterOverlayProps {
  filters: string[];
  selected: SharedValue<number>;
}

export function FilterOverlay(props: FilterOverlayProps) {
  const style = useAnimatedStyle(() => {
    const progress = props.selected.value % 1;

    return {
      opacity: 0.3 * (Math.abs(progress - 0.5) * 2),
      backgroundColor: props.filters[Math.round(props.selected.value)],
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents={'none'}
    />
  );
}

interface CaptureButtonProps {
  progress: SharedValue<number>;
}

function CaptureButton(props: CaptureButtonProps) {
  const radius = CAROUSEL_SIZE / 2;
  const svgRadius = CAROUSEL_SIZE / 2 - RECORD_INDICATOR_STROKE * 0.5;
  const circumference = svgRadius * 2 * Math.PI;

  const animatedProps = useAnimatedProps(() => {
    const svgProgress = 100 - props.progress.value * 100;
    return {
      strokeDashoffset: svgRadius * Math.PI * 2 * (svgProgress / 100),
    };
  });

  return (
    <Animated.View style={styles.shutterContainer}>
      <Animated.View style={styles.shutterButtonBackground} />
      <Svg style={styles.shutterButtonRecordingIndicator}>
        <AnimatedCircle
          cx={radius}
          cy={radius}
          r={svgRadius}
          stroke={'red'}
          strokeLinecap="round"
          fill={'transparent'}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeWidth={RECORD_INDICATOR_STROKE}
          animatedProps={animatedProps}
        />
      </Svg>
    </Animated.View>
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
  shutterContainer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: CAROUSEL_SIZE,
    height: CAROUSEL_SIZE,
    transform: [{ translateX: -CAROUSEL_SIZE / 2 }],
  },
  shutterButtonBackground: {
    width: CAROUSEL_SIZE,
    height: CAROUSEL_SIZE,
    borderRadius: CAROUSEL_SIZE / 2,
    borderWidth: RECORD_INDICATOR_STROKE,
    borderColor: 'white',
    position: 'absolute',
  },
  shutterButtonRecordingIndicator: {
    width: CAROUSEL_SIZE,
    height: CAROUSEL_SIZE,
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -CAROUSEL_SIZE / 2 }, { rotateZ: '-90deg' }],
  },
});
