import { ReactNode, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  SafeAreaView,
  LayoutChangeEvent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  Pressable,
} from 'react-native-gesture-handler';

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

  const touchOnPlayerX = new Animated.Value(0);
  const touchOnPlayerY = new Animated.Value(0);

  const onPlayerVerticalDrag = Animated.event([
    {
      translationY: touchOnPlayerY,
    },
  ]);

  const onPlayerSwipeAway = Animated.event([
    {
      translationX: touchOnPlayerX,
    },
  ]);

  const showFullDetails = () => {
    setShowFullDetails(true);
  };

  const pictureInPicturePlayerSize = () => {
    const { height } = Dimensions.get('window');
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
  };

  const playerMaximumTopOffset = () => {
    const { height } = Dimensions.get('window');
    const bottomPlayerPadding = PICTURE_IN_PICTURE_PLAYER_PADDING + 100;

    return height - pictureInPicturePlayerSize().height - bottomPlayerPadding;
  };

  const playerMaximumLeftOffset = () => {
    const { width } = Dimensions.get('window');
    return (
      width -
      pictureInPicturePlayerSize().width -
      PICTURE_IN_PICTURE_PLAYER_PADDING
    );
  };

  const playerPictureInPictureScale = () => {
    const { width } = Dimensions.get('window');
    return pictureInPicturePlayerSize().width / width;
  };

  const playerDragYPosition = () => {
    return Animated.add(
      touchOnPlayerY,
      new Animated.Value(isFullDetails ? 0 : playerMaximumTopOffset())
    );
  };

  const playerSwipeAwayStyle = () => {
    const smallPlayerWidth = pictureInPicturePlayerSize().width;

    return {
      opacity: touchOnPlayerX.interpolate({
        extrapolate: 'clamp',
        inputRange: [
          -smallPlayerWidth * SWIPE_AWAY_OPACITY_DROP_OFF_MULTIPLIER,
          0,
          smallPlayerWidth * SWIPE_AWAY_OPACITY_DROP_OFF_MULTIPLIER,
        ],
        outputRange: [INVISIBLE, VISIBLE, INVISIBLE],
      }),
      transform: [
        {
          translateX: touchOnPlayerX.interpolate({
            inputRange: [-smallPlayerWidth, 0, smallPlayerWidth],
            outputRange: [
              -(smallPlayerWidth * playerPictureInPictureScale()),
              0,
              smallPlayerWidth * playerPictureInPictureScale(),
            ],
          }),
        },
      ],
    };
  };

  const playerPositionOffsetBecauseOfScale = () => {
    return {
      x:
        (playerSize.width * playerPictureInPictureScale() - playerSize.width) /
        2,
      y:
        (playerSize.height * playerPictureInPictureScale() -
          playerSize.height) /
        2,
    };
  };

  const playerAnimatedStyle = () => {
    return {
      transform: [
        {
          translateX: playerDragYPosition().interpolate({
            extrapolate: 'clamp',
            inputRange: [0, playerMaximumTopOffset()],
            outputRange: [
              0,
              playerMaximumLeftOffset() +
                playerPositionOffsetBecauseOfScale().x,
            ],
          }),
        },
        {
          translateY: playerDragYPosition().interpolate({
            extrapolate: 'clamp',
            inputRange: [0, playerMaximumTopOffset()],
            outputRange: [
              0,
              playerMaximumTopOffset() + playerPositionOffsetBecauseOfScale().y,
            ],
          }),
        },
        {
          scale: playerDragYPosition().interpolate({
            extrapolate: 'clamp',
            inputRange: [0, playerMaximumTopOffset()],
            outputRange: [1, playerPictureInPictureScale()],
          }),
        },
      ],
    };
  };

  const bodyAnimatedStyle = () => {
    const playerSizeDifferenceAfterScale =
      playerSize.height - pictureInPicturePlayerSize().height;

    return {
      opacity: playerDragYPosition().interpolate({
        extrapolate: 'clamp',
        inputRange: [0, playerMaximumTopOffset()],
        outputRange: [VISIBLE, INVISIBLE],
      }),
      transform: [
        {
          translateY: playerDragYPosition().interpolate({
            extrapolate: 'clamp',
            inputRange: [0, playerMaximumTopOffset()],
            outputRange: [
              0,
              playerMaximumTopOffset() - playerSizeDifferenceAfterScale,
            ],
          }),
        },
        {
          translateX: playerDragYPosition().interpolate({
            extrapolate: 'clamp',
            inputRange: [0, playerMaximumTopOffset()],
            outputRange: [0, playerMaximumLeftOffset()],
          }),
        },
      ],
    };
  };

  const topSafeAreaStyle = () => {
    return [
      styles.topSafeArea,
      {
        opacity: playerDragYPosition().interpolate({
          extrapolate: 'clamp',
          inputRange: [
            0,
            playerMaximumTopOffset() * SAFE_AREA_OPACITY_DROP_OFF_PERCENTAGE,
          ],
          outputRange: [VISIBLE, INVISIBLE],
        }),
      },
    ];
  };

  const setShowFullDetails = (activateFullDetails: boolean) => {
    setIsDraggingEnabled(false);

    const isFullDetailsYOffset = isFullDetails ? 0 : playerMaximumTopOffset();
    Animated.timing(touchOnPlayerY, {
      duration: ANIMATION_LENGTH,
      toValue:
        (activateFullDetails ? 0 : playerMaximumTopOffset()) -
        isFullDetailsYOffset,
      useNativeDriver: true,
    }).start(() => {
      setIsDraggingEnabled(true);
      setIsFullDetails(activateFullDetails);
    });
  };

  const onPlayerLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setPlayerSize({
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
      onPlayerVerticalDrag(event);
    })
    .onEnd((event) => {
      const transitionThreshold =
        playerMaximumTopOffset() *
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
      onPlayerSwipeAway(event);
    })
    .onEnd((event) => {
      setIsDraggingEnabled(false);
      const { width } = Dimensions.get('window');
      const swipeAwayDistance =
        pictureInPicturePlayerSize().width * SWIPE_AWAY_THRESHOLD_PERCENTAGE;
      const isSwipeAwaySuccesful =
        Math.abs(event.translationX) > swipeAwayDistance;
      if (isSwipeAwaySuccesful) {
        Animated.timing(touchOnPlayerX, {
          duration: ANIMATION_LENGTH,
          toValue:
            (event.translationX > 0 ? 1 : -1) *
            width *
            SWIPE_AWAY_SPEED_MULTIPLIER,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(touchOnPlayerX, {
          duration: ANIMATION_LENGTH,
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          setIsDraggingEnabled(true);
        });
      }
    });

  return (
    <View style={styles.container} pointerEvents={containerPointerEvents}>
      <AnimatedSafeAreView
        style={topSafeAreaStyle()}
        pointerEvents={containerPointerEvents}
      />
      <Animated.View
        style={styles.movingContent}
        pointerEvents={containerPointerEvents}>
        <GestureDetector gesture={verticalDragGesture}>
          <Animated.View
            style={playerSwipeAwayStyle()}
            pointerEvents={containerPointerEvents}>
            <GestureDetector gesture={swipeAwayGesture}>
              <Animated.View
                style={playerAnimatedStyle()}
                pointerEvents={containerPointerEvents}
                onLayout={(event) => onPlayerLayout(event)}>
                <Pressable
                  onPress={() => showFullDetails()}
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
          style={[styles.bodyContainer, bodyAnimatedStyle()]}
          pointerEvents={isFullDetails ? 'auto' : 'none'}
        />
      </Animated.View>
    </View>
  );
};
