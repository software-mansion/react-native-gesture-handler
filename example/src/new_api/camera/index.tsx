import React, { useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const filters = ['red', 'green', 'blue', 'yellow', 'orange', 'cyan'];
const MAX_VIDEO_DURATION_MS = 60_000;
const CAPTURE_BUTTON_RADIUS = 50;
const FILTER_BUTTON_RADIUS = 35;

export default function Home() {
  const filter = useSharedValue(0);
  const filterOffset = useSharedValue(0);
  const zoom = useSharedValue(1);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTimeMs, setRemainingTimeMs] = useState(MAX_VIDEO_DURATION_MS);
  const [recordingIntervalHandle, setRecordingIntervalHandle] = useState(-1);

  const filtersPanGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      filter.value = filter.value + (filterOffset.value - e.translationX) / 100;
      filterOffset.value = e.translationX;

      runOnJS(updateSelectedFilter)();
    })
    .onEnd(() => {
      'worklet';
      filterOffset.value = 0;
      runOnJS(stopFilterScroll)();
    });

  const buttonTapGesture = Gesture.Tap().onEnd((_e, success) => {
    'worklet';
    if (success) {
      runOnJS(takePhoto)();
    }
  });

  const buttonDoubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      'worklet';
      if (success) {
        runOnJS(takeSeries)();
      }
    });

  const buttonPanGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(filtersPanGesture)
    .onUpdate((e) => {
      'worklet';
      if (isRecording) {
        if (e.velocityY < 0) {
          zoom.value *= 1.05;
        } else if (e.velocityY > 0) {
          zoom.value *= 0.95;
        }
      }
    });

  const buttonLongPressGesture = Gesture.LongPress()
    .maxDistance(10000)
    .onStart(() => {
      'worklet';
      runOnJS(startRecording)();
    })
    .onEnd(() => {
      'worklet';
      if (isRecording) {
        runOnJS(finishRecording)();
      }
    });

  const previewPinchGesture = Gesture.Pinch().onChange((e) => {
    'worklet';
    zoom.value *= e.scaleChange;
  });

  const buttonGesture = Gesture.Simultaneous(
    buttonLongPressGesture,
    Gesture.Exclusive(
      buttonPanGesture,
      buttonDoubleTapGesture,
      buttonTapGesture
    )
  );

  function stopFilterScroll() {
    filter.value = withTiming(updateSelectedFilter(), { duration: 200 });
  }

  function updateSelectedFilter() {
    const selectedFilter = Math.round(
      Math.min(filters.length - 1, Math.max(filter.value, 0))
    );
    setSelectedFilter(selectedFilter);

    return selectedFilter;
  }

  function takePhoto() {
    Alert.alert('You took a photo');
  }

  function takeSeries() {
    Alert.alert('You took a series of photos');
  }

  function startRecording() {
    setIsRecording(true);
    setRemainingTimeMs(MAX_VIDEO_DURATION_MS);
    setRecordingIntervalHandle(
      setInterval(() => {
        setRemainingTimeMs((r) => r - 200);
      }, 200)
    );
  }

  function finishRecording() {
    setIsRecording(false);
    clearInterval(recordingIntervalHandle);
    setRemainingTimeMs(MAX_VIDEO_DURATION_MS);

    Alert.alert(
      `You took a video (${(MAX_VIDEO_DURATION_MS - remainingTimeMs) / 1000} s)`
    );
  }

  const zoomStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: zoom.value }] };
  });

  return (
    <Animated.View style={styles.container}>
      <GestureDetector gesture={previewPinchGesture}>
        <Animated.View
          style={[styles.home, { backgroundColor: filters[selectedFilter] }]}>
          <Animated.View style={[styles.box, zoomStyle]} />
        </Animated.View>
      </GestureDetector>

      <GestureDetector gesture={filtersPanGesture}>
        <Animated.View style={styles.buttonContainer}>
          <FilterCarousel filters={filters} selected={filter} />
          <GestureDetector gesture={buttonGesture}>
            <CaptureButton
              progress={1 - remainingTimeMs / MAX_VIDEO_DURATION_MS}
              onTimerFinished={() => {
                finishRecording();
              }}
            />
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    opacity: 0.5,
  },
  buttonContainer: {
    width: '100%',
    height: CAPTURE_BUTTON_RADIUS * 2,
    position: 'absolute',
    bottom: 50,
    zIndex: 10,
  },
  box: {
    alignSelf: 'center',
    margin: 100,
    width: 200,
    height: 200,
    backgroundColor: 'black',
  },
});

function FilterCarousel(props: {
  filters: string[];
  selected: Animated.SharedValue<number>;
}) {
  return (
    <Animated.View style={filterCarouselStyles.container}>
      {props.filters.map((filter) => (
        <Filter key={filter} filter={filter} selected={props.selected} />
      ))}
    </Animated.View>
  );
}

function Filter(props: {
  filter: string;
  selected: Animated.SharedValue<number>;
}) {
  const window = useWindowDimensions();
  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            window.width / 2 -
            CAPTURE_BUTTON_RADIUS -
            CAPTURE_BUTTON_RADIUS * 2 * props.selected.value,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        filterCarouselStyles.filter,
        style,
        { backgroundColor: props.filter },
      ]}
    />
  );
}

const filterCarouselStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: CAPTURE_BUTTON_RADIUS * 2,
    alignSelf: 'center',
    position: 'absolute',
    flexDirection: 'row',
  },
  filter: {
    width: FILTER_BUTTON_RADIUS * 2,
    height: FILTER_BUTTON_RADIUS * 2,
    borderRadius: FILTER_BUTTON_RADIUS * 2,
    alignSelf: 'flex-start',
    margin: CAPTURE_BUTTON_RADIUS - FILTER_BUTTON_RADIUS,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
});

function CaptureButton(props: {
  progress: number;
  onTimerFinished: () => void;
}) {
  function getOverlay(progress: number) {
    if (progress > 1) {
      progress = 1;

      props.onTimerFinished?.();
    }

    const progressBelowHalf = progress <= 0.5;
    return (
      <Animated.View
        style={[
          captureButtonStyles.overlay,
          progressBelowHalf
            ? captureButtonStyles.overlayLessThanHalf
            : captureButtonStyles.overlayMoreThanHalf,
          {
            transform: [
              {
                rotateZ: `${
                  45 + 360 * (progressBelowHalf ? progress : progress - 0.5)
                }deg`,
              },
            ],
          },
        ]}
      />
    );
  }

  return (
    <Animated.View style={captureButtonStyles.container}>
      <Animated.View style={captureButtonStyles.progress} />
      {getOverlay(props.progress)}
    </Animated.View>
  );
}

const captureButtonStyles = StyleSheet.create({
  container: {
    width: CAPTURE_BUTTON_RADIUS * 2,
    height: CAPTURE_BUTTON_RADIUS * 2,
    alignSelf: 'center',
    borderWidth: 8,
    borderRadius: CAPTURE_BUTTON_RADIUS * 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  progress: {
    width: CAPTURE_BUTTON_RADIUS * 2,
    height: CAPTURE_BUTTON_RADIUS * 2,
    borderWidth: 8,
    borderRadius: CAPTURE_BUTTON_RADIUS,
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'red',
    borderRightColor: 'red',
    transform: [{ rotateZ: '45deg' }],
  },
  overlay: {
    width: CAPTURE_BUTTON_RADIUS * 2,
    height: CAPTURE_BUTTON_RADIUS * 2,
    borderWidth: 8,
    borderRadius: CAPTURE_BUTTON_RADIUS,
    position: 'absolute',
  },
  overlayLessThanHalf: {
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'white',
    borderRightColor: 'white',
  },
  overlayMoreThanHalf: {
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'red',
    borderRightColor: 'red',
  },
});
