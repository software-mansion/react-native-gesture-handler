import React, { ReactNode, useMemo, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  LayoutChangeEvent,
  SafeAreaView,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  Pressable,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedSafeAreView = Animated.createAnimatedComponent(SafeAreaView);

const PAN_RESPOND_THRESHOLD = 20;
const PICTURE_IN_PICTURE_PLAYER_HEIGHT_PERCENTAGE = 0.12;
const PICTURE_IN_PICTURE_PLAYER_PADDING = 5;
const SAFE_AREA_OPACITY_DROP_OFF_PERCENTAGE = 0.2;

const ANIMATION_LENGTH = 250;
const PICTURE_IN_PICTURE_TRANSITION_THRESHOLD_PERCENTAGE = 0.2;
const SWIPE_AWAY_THRESHOLD_PERCENTAGE = 0.75;
const SWIPE_AWAY_OPACITY_DROP_OFF_MULTIPLIER = 2;
const SWIPE_AWAY_SPEED_MULTIPLIER = 2;

const VISIBLE = 1;
const INVISIBLE = 0;

const styles = StyleSheet.create({
  bodyContainer: {
    backgroundColor: 'gray',
    flex: 1,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  movingContent: {
    flex: 1,
  },
  topSafeArea: {
    backgroundColor: 'black',
  },
});

type PipLayoutProps = {
  player: ReactNode;
};

export const PipLayout = (props: PipLayoutProps) => {
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
  const [isFullDetails, setIsFullDetails] = useState(true);
  const [playerSize, setPlayerSize] = useState({
    height: 0,
    width: 0,
  });

  const touchOnPlayerX = useSharedValue(0);
  const touchOnPlayerY = useSharedValue(0);

  const { width, height } = useMemo(() => Dimensions.get('window'), []);

  const pictureInPicturePlayerSize = useMemo(() => {
    'worklet';
    const minPlayerHeight =
      height * PICTURE_IN_PICTURE_PLAYER_HEIGHT_PERCENTAGE;
    // Initially there is no player height. That is why we have a fallback
    const aspectRatio = playerSize.height
      ? playerSize.width / playerSize.height
      : 0;
    return {
      height: minPlayerHeight,
      width: minPlayerHeight * aspectRatio,
    };
  }, [height, playerSize]);

  const playerMaximumTopOffset = useMemo(() => {
    'worklet';
    const bottomPlayerPadding = PICTURE_IN_PICTURE_PLAYER_PADDING + 100;

    return height - pictureInPicturePlayerSize.height - bottomPlayerPadding;
  }, [height, pictureInPicturePlayerSize]);

  const playerMaximumLeftOffset = useMemo(() => {
    'worklet';
    return (
      width -
      pictureInPicturePlayerSize.width -
      PICTURE_IN_PICTURE_PLAYER_PADDING
    );
  }, [pictureInPicturePlayerSize, width]);

  const playerPictureInPictureScale = useMemo(() => {
    'worklet';
    return pictureInPicturePlayerSize.width / width;
  }, [pictureInPicturePlayerSize, width]);

  const playerDragYPosition = useDerivedValue(
    () => touchOnPlayerY.value + (isFullDetails ? 0 : playerMaximumTopOffset)
  );

  const playerSwipeAwayStyle = useAnimatedStyle(() => {
    const smallPlayerWidth = pictureInPicturePlayerSize.width;

    return {
      opacity: interpolate(
        touchOnPlayerX.value,
        [
          -smallPlayerWidth * SWIPE_AWAY_OPACITY_DROP_OFF_MULTIPLIER,
          0,
          smallPlayerWidth * SWIPE_AWAY_OPACITY_DROP_OFF_MULTIPLIER,
        ],
        [INVISIBLE, VISIBLE, INVISIBLE],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateX: interpolate(
            touchOnPlayerX.value,
            [-smallPlayerWidth, 0, smallPlayerWidth],
            [
              -(smallPlayerWidth * playerPictureInPictureScale),
              0,
              smallPlayerWidth * playerPictureInPictureScale,
            ]
          ),
        },
      ],
    };
  });

  const playerPositionOffsetBecauseOfScale = useMemo(() => {
    'worklet';
    return {
      x:
        (playerSize.width * playerPictureInPictureScale - playerSize.width) / 2,
      y:
        (playerSize.height * playerPictureInPictureScale - playerSize.height) /
        2,
    };
  }, [playerPictureInPictureScale, playerSize.height, playerSize.width]);

  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            playerDragYPosition.value,
            [0, playerMaximumTopOffset],
            [0, playerMaximumLeftOffset + playerPositionOffsetBecauseOfScale.x],
            Extrapolation.CLAMP
          ),
        },
        {
          translateY: interpolate(
            playerDragYPosition.value,
            [0, playerMaximumTopOffset],
            [0, playerMaximumTopOffset + playerPositionOffsetBecauseOfScale.y],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            playerDragYPosition.value,
            [0, playerMaximumTopOffset],
            [1, playerPictureInPictureScale],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const bodyAnimatedStyle = useAnimatedStyle(() => {
    const playerSizeDifferenceAfterScale =
      playerSize.height - pictureInPicturePlayerSize.height;

    return {
      opacity: interpolate(
        playerDragYPosition.value,
        [0, playerMaximumTopOffset],
        [VISIBLE, INVISIBLE],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            playerDragYPosition.value,
            [0, playerMaximumTopOffset],
            [0, playerMaximumTopOffset - playerSizeDifferenceAfterScale],
            Extrapolation.CLAMP
          ),
        },
        {
          translateX: interpolate(
            playerDragYPosition.value,
            [0, playerMaximumTopOffset],
            [0, playerMaximumLeftOffset],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const topSafeAreaStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        playerDragYPosition.value,
        [0, playerMaximumTopOffset * SAFE_AREA_OPACITY_DROP_OFF_PERCENTAGE],
        [0, playerMaximumTopOffset * SAFE_AREA_OPACITY_DROP_OFF_PERCENTAGE],
        Extrapolation.CLAMP
      ),
    };
  });

  const setShowFullDetails = (activateFullDetails: boolean) => {
    'worklet';
    runOnJS(setIsDraggingEnabled)(false);

    const isFullDetailsYOffset = isFullDetails ? 0 : playerMaximumTopOffset;
    touchOnPlayerY.value = withTiming(
      (activateFullDetails ? 0 : playerMaximumTopOffset) - isFullDetailsYOffset,
      { duration: ANIMATION_LENGTH },
      () => {
        'worklet';
        runOnJS(setIsDraggingEnabled)(true);
        runOnJS(setIsFullDetails)(activateFullDetails);
      }
    );
  };

  const onPlayerLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    'worklet';
    runOnJS(setPlayerSize)({
      height: layout.height,
      width: layout.width,
    });
  };

  const { player } = props;

  const containerPointerEvents = isFullDetails ? 'auto' : 'box-none';

  const verticalDragGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(isDraggingEnabled)
    .activeOffsetY([-PAN_RESPOND_THRESHOLD, PAN_RESPOND_THRESHOLD])
    .onUpdate((event) => {
      touchOnPlayerY.value = event.translationY;
    })
    .onEnd((event) => {
      const transitionThreshold =
        playerMaximumTopOffset *
        PICTURE_IN_PICTURE_TRANSITION_THRESHOLD_PERCENTAGE;
      const activateFullDetails =
        (isFullDetails && event.translationY < transitionThreshold) ||
        (!isFullDetails && Math.abs(event.translationY) > transitionThreshold);
      setShowFullDetails(activateFullDetails);
    });

  const swipeAwayGesture = Gesture.Pan()
    .enabled(!isFullDetails && isDraggingEnabled)
    .activeOffsetX([-PAN_RESPOND_THRESHOLD, PAN_RESPOND_THRESHOLD])
    .onUpdate((event) => {
      touchOnPlayerX.value = event.translationX;
    })
    .onEnd((event) => {
      runOnJS(setIsDraggingEnabled)(false);

      const swipeAwayDistance =
        pictureInPicturePlayerSize.width * SWIPE_AWAY_THRESHOLD_PERCENTAGE;
      const isSwipeAwaySuccesful =
        Math.abs(event.translationX) > swipeAwayDistance;
      if (isSwipeAwaySuccesful) {
        touchOnPlayerX.value = withTiming(
          (event.translationX > 0 ? 1 : -1) *
            width *
            SWIPE_AWAY_SPEED_MULTIPLIER,
          { duration: ANIMATION_LENGTH }
        );
      } else {
        touchOnPlayerX.value = withTiming(
          0,
          { duration: ANIMATION_LENGTH },
          () => {
            'worklet';
            runOnJS(setIsDraggingEnabled)(true);
          }
        );
      }
    });

  return (
    <View style={styles.container} pointerEvents={containerPointerEvents}>
      <AnimatedSafeAreView
        style={[styles.topSafeArea, topSafeAreaStyle]}
        pointerEvents={containerPointerEvents}
      />
      <Animated.View
        style={styles.movingContent}
        pointerEvents={containerPointerEvents}>
        <GestureDetector gesture={verticalDragGesture}>
          <Animated.View
            style={playerSwipeAwayStyle}
            pointerEvents={containerPointerEvents}>
            <GestureDetector gesture={swipeAwayGesture}>
              <Animated.View
                style={playerAnimatedStyle}
                pointerEvents={containerPointerEvents}
                onLayout={(event) => onPlayerLayout(event)}>
                <Pressable
                  onPress={() => setShowFullDetails(true)}
                  disabled={isFullDetails || !isDraggingEnabled}>
                  <View pointerEvents={isFullDetails ? 'auto' : 'box-only'}>
                    {player}
                  </View>
                </Pressable>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
        <Animated.View
          style={[styles.bodyContainer, bodyAnimatedStyle]}
          pointerEvents={isFullDetails ? 'auto' : 'none'}
        />
      </Animated.View>
    </View>
  );
};
