import React, { useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { GestureMonitor, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useAnimatedGesture } from '../useAnimatedGesture';

const filters = ['red', 'green', 'blue', 'yellow', 'orange', 'cyan'];
const MAX_VIDEO_DURATION = 60000;
const CAPTURE_BUTTON_RADIUS = 50;
const FILTER_BUTTON_RADIUS = 35;

export default function Home() {
  const filter = useSharedValue(0);
  const filterOffset = useSharedValue(0);
  const zoom = useSharedValue(1);
  const [scale, setScale] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState(MAX_VIDEO_DURATION);
  const [recordingIntervalHandle, setRecordingIntervalHandle] = useState(-1);

  const filtersPanGesture = Gesture.pan()
    .setOnUpdate((e) => {
      'worklet';
      filter.value =
        filter.value + (filterOffset.value - e.translationX) * 0.01;
      filterOffset.value = e.translationX;

      runOnJS(updateSelectedFilter)();
    })
    .setOnEnd(() => {
      'worklet';
      filterOffset.value = 0;
      runOnJS(stopFilterScroll)();
    });

  const buttonTapGesture = Gesture.tap().setOnEnd((e, success) => {
    'worklet';
    if (success) {
      runOnJS(takePhoto)();
    }
  });

  const buttonDoubleTapGesture = Gesture.tap()
    .setTapCount(2)
    .setOnEnd((e, success) => {
      'worklet';
      if (success) {
        runOnJS(takeSeries)();
      }
    });

  const buttonPanGesture = Gesture.pan()
    .addSimultaneousGesture(filtersPanGesture)
    .setOnUpdate((e) => {
      'worklet';
      if (isRecording) {
        if (e.velocityY < 0) {
          zoom.value *= 1.05;
        } else if (e.velocityY > 0) {
          zoom.value *= 0.95;
        }
      }
    })
    .setOnEnd((e) => {
      'worklet';
      if (isRecording) {
        runOnJS(finishRecording)();
      }
    });

  const buttonLongPressGesture = Gesture.longPress().setOnStart(() => {
    'worklet';
    runOnJS(startRecording)();
  });

  const previewPinchGesture = Gesture.pinch()
    .setOnStart(() => {
      'worklet';
      runOnJS(setScale)(zoom.value);
    })
    .setOnUpdate((e) => {
      'worklet';
      zoom.value = scale * e.scale;
    });

  const panGestureHandler = useAnimatedGesture(filtersPanGesture);

  const buttonGestureHandler = useAnimatedGesture(
    buttonTapGesture
      .requireToFail(buttonDoubleTapGesture)
      .simultaneousWith(buttonPanGesture)
      .simultaneousWith(buttonLongPressGesture)
  );

  const scaleGestureHandler = useAnimatedGesture(previewPinchGesture);

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
    setRemainingTime(MAX_VIDEO_DURATION);
    setRecordingIntervalHandle(
      setInterval(() => {
        setRemainingTime((r) => r - 200);
      }, 200)
    );
  }

  function finishRecording() {
    setIsRecording(false);
    clearInterval(recordingIntervalHandle);
    setRemainingTime(MAX_VIDEO_DURATION);

    Alert.alert(
      'You took a video (' +
        (MAX_VIDEO_DURATION - remainingTime) * 0.001 +
        ' s)'
    );
  }

  const zoomStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: zoom.value }] };
  });

  return (
    <Animated.View style={styles.container}>
      <GestureMonitor gesture={scaleGestureHandler}>
        <Animated.View
          style={[styles.home, { backgroundColor: filters[selectedFilter] }]}>
          <Animated.View style={[styles.box, zoomStyle]} />
        </Animated.View>
      </GestureMonitor>

      <GestureMonitor gesture={panGestureHandler}>
        <Animated.View style={styles.buttonContainer}>
          <FilterCarousel filters={filters} selected={filter} />
          <GestureMonitor gesture={buttonGestureHandler}>
            <CaptureButton
              progress={1 - remainingTime / MAX_VIDEO_DURATION}
              onTimerFinished={() => {
                finishRecording();
              }}
            />
          </GestureMonitor>
        </Animated.View>
      </GestureMonitor>
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
  shutterContainer: {
    width: CAPTURE_BUTTON_RADIUS * 2,
    height: CAPTURE_BUTTON_RADIUS * 2,
    alignSelf: 'center',
  },
  box: {
    alignSelf: 'center',
    margin: 100,
    width: 200,
    height: 200,
    backgroundColor: 'black',
  },
});

function FilterCarousel(props) {
  return (
    <Animated.View style={filterCarouselStyles.container}>
      {props.filters.map((filter) => (
        <Filter key={filter} filter={filter} selected={props.selected} />
      ))}
    </Animated.View>
  );
}

function Filter(props) {
  const window = useWindowDimensions();
  let style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            window.width * 0.5 -
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

function CaptureButton(props) {
  function getOverlay(progress) {
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
