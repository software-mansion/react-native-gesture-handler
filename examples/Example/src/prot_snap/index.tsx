import React, { useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions } from 'react-native';
import {
  GestureMonitor,
  Pan,
  Pinch,
  LongPress,
  Tap,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAnimatedGesture } from '../useAnimatedGesture';

const filters = ['red', 'green', 'blue', 'yellow', 'orange', 'cyan'];
const MAX_VIDEO_DURATION = 60000;

export default function Home() {
  const filter = useSharedValue(0);
  const filterOffset = useSharedValue(0);
  const zoom = useSharedValue(1);
  const [scale, setScale] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [recording, setRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState(MAX_VIDEO_DURATION);
  const [recordingInterval, setRecordingInterval] = useState(-1);

  const filtersPanGesture = new Pan({
    onUpdate: (e) => {
      filter.value =
        filter.value + (filterOffset.value - e.translationX) * 0.01;
      filterOffset.value = e.translationX;

      updateSelectedFilter();
    },
    onEnd: () => {
      filterOffset.value = 0;
      filter.value = withTiming(updateSelectedFilter(), { duration: 200 });
    },
  });

  const buttonTapGesture = new Tap({
    maxDist: 3,
    onEnd: (e, success) => {
      if (success) Alert.alert('You took a photo');
    },
  });

  const buttonDoubleTapGesture = new Tap({
    maxDist: 3,
    numberOfTaps: 2,
    priority: 1,
    onEnd: (e, success) => {
      if (success) {
        Alert.alert('You took a series of photos');
      }
    },
  });

  const buttonPanGesture = new Pan({
    simultaneousWith: filtersPanGesture,
    onUpdate: (e) => {
      if (recording) {
        if (e.velocityY < 0) {
          zoom.value = zoom.value * 1.05;
        } else if (e.velocityY > 0) {
          zoom.value = zoom.value * 0.95;
        }
      }
    },
    onEnd: (e) => {
      if (recording) {
        finishRecording();
      }
    },
  });

  const buttonLongPressGesture = new LongPress({
    onStart: () => {
      setRecording(true);
      setRemainingTime(MAX_VIDEO_DURATION);
      setRecordingInterval(
        setInterval(() => {
          setRemainingTime((r) => r - 200);
        }, 200)
      );
    },
  });

  const previewPinchGesture = new Pinch({
    onStart: () => {
      setScale(zoom.value);
    },
    onUpdate: (e) => {
      zoom.value = scale * e.scale;
    },
  });

  const panGestureHandler = useAnimatedGesture(filtersPanGesture);

  const buttonGestureHandler = useAnimatedGesture(
    buttonTapGesture
      .simultaneousWith(buttonLongPressGesture)
      .simultaneousWith(buttonPanGesture)
      .simultaneousWith(buttonDoubleTapGesture)
  );

  const scaleGestureHandler = useAnimatedGesture(previewPinchGesture);

  if (remainingTime <= 0) {
    finishRecording();
  }

  function updateSelectedFilter() {
    let targetFilter = Math.round(filter.value);
    if (targetFilter < 0) targetFilter = 0;
    if (targetFilter >= filters.length) targetFilter = filters.length - 1;
    setSelectedFilter(targetFilter);

    return targetFilter;
  }

  function finishRecording() {
    setRecording(false);
    clearInterval(recordingInterval);
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
            <Animated.View style={styles.shutterContainer}>
              <CaptureButton
                progress={1 - remainingTime / MAX_VIDEO_DURATION}
              />
            </Animated.View>
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
    height: 100,
    position: 'absolute',
    bottom: 50,
    zIndex: 10,
  },
  shutterContainer: {
    width: 100,
    height: 100,
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
      {props.filters.map((filter) => {
        return (
          <Filter key={filter} filter={filter} selected={props.selected} />
        );
      })}
    </Animated.View>
  );
}

function Filter(props) {
  const window = useWindowDimensions();
  let style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: window.width * 0.5 - 35 - 15 - 100 * props.selected.value,
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
    height: 100,
    alignSelf: 'center',
    position: 'absolute',
    flexDirection: 'row',
  },
  filter: {
    width: 70,
    height: 70,
    borderRadius: 100,
    alignSelf: 'flex-start',
    margin: 15,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
});

function CaptureButton(props) {
  function getOverlay(progress) {
    if (progress > 1) {
      progress = 1;
    }

    if (progress <= 0.5) {
      return (
        <Animated.View
          style={[
            captureButtonStyles.overlay,
            captureButtonStyles.overlayLessThanHalf,
            {
              transform: [{ rotateZ: 45 + 360 * progress + 'deg' }],
            },
          ]}
        />
      );
    } else {
      return (
        <Animated.View
          style={[
            captureButtonStyles.overlay,
            captureButtonStyles.overlayMoreThanHalf,
            {
              transform: [{ rotateZ: 45 + 360 * (progress - 0.5) + 'deg' }],
            },
          ]}
        />
      );
    }
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
    width: 100,
    height: 100,
    alignSelf: 'center',
    borderWidth: 8,
    borderRadius: 100,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  progress: {
    width: 100,
    height: 100,
    borderWidth: 8,
    borderRadius: 50,
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'red',
    borderRightColor: 'red',
    transform: [{ rotateZ: '45deg' }],
  },
  overlay: {
    width: 100,
    height: 100,
    borderWidth: 8,
    borderRadius: 50,
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
