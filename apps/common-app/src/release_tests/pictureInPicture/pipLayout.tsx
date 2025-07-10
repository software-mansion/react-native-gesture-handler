import React, { Component, ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State as PanState,
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

type Props = {
  player: ReactNode;
};
type State = {
  isDraggingEnabled: boolean;
  isFullDetails: boolean;
  playerSize: {
    width: number;
    height: number;
  };
};

export default class PipLayout extends Component<Props, State> {
  touchOnPlayerX = new Animated.Value(0);
  touchOnPlayerY = new Animated.Value(0);

  onPlayerVerticalDrag = Animated.event(
    [
      {
        nativeEvent: { translationY: this.touchOnPlayerY },
      },
    ],
    {
      useNativeDriver: true,
    }
  );

  onPlayerSwipeAway = Animated.event(
    [
      {
        nativeEvent: { translationX: this.touchOnPlayerX },
      },
    ],
    {
      useNativeDriver: true,
    }
  );

  constructor(props: Props) {
    super(props);

    this.state = {
      isDraggingEnabled: true,
      isFullDetails: true,
      playerSize: {
        height: 0,
        width: 0,
      },
    };

    this.onPlayerVerticalDragStateChange =
      this.onPlayerVerticalDragStateChange.bind(this);
    this.onPlayerSwipeAwayStateChange =
      this.onPlayerSwipeAwayStateChange.bind(this);
    this.setShowFullDetails = this.setShowFullDetails.bind(this);
    this.showFullDetails = this.showFullDetails.bind(this);
    this.showPictureInPicture = this.showPictureInPicture.bind(this);
    this.onPlayerLayout = this.onPlayerLayout.bind(this);
  }

  showFullDetails() {
    this.setShowFullDetails(true);
  }

  showPictureInPicture() {
    this.setShowFullDetails(false);
  }

  render() {
    const { player } = this.props;
    const { isFullDetails, isDraggingEnabled } = this.state;

    const containerPointerEvents = isFullDetails ? 'auto' : 'box-none';

    return (
      <View style={styles.container} pointerEvents={containerPointerEvents}>
        <AnimatedSafeAreView
          style={this.topSafeAreaStyle}
          pointerEvents={containerPointerEvents}
        />
        <Animated.View
          style={styles.movingContent}
          pointerEvents={containerPointerEvents}>
          <PanGestureHandler
            onGestureEvent={this.onPlayerVerticalDrag}
            onHandlerStateChange={this.onPlayerVerticalDragStateChange}
            enabled={this.state.isDraggingEnabled}
            activeOffsetY={[-PAN_RESPOND_THRESHOLD, PAN_RESPOND_THRESHOLD]}>
            <Animated.View
              style={this.playerSwipeAwayStyle}
              pointerEvents={containerPointerEvents}>
              <PanGestureHandler
                onGestureEvent={this.onPlayerSwipeAway}
                onHandlerStateChange={this.onPlayerSwipeAwayStateChange}
                enabled={!isFullDetails && isDraggingEnabled}
                activeOffsetX={[-PAN_RESPOND_THRESHOLD, PAN_RESPOND_THRESHOLD]}>
                <Animated.View
                  style={this.playerAnimatedStyle}
                  pointerEvents={containerPointerEvents}
                  onLayout={this.onPlayerLayout}>
                  <TouchableWithoutFeedback
                    onPress={this.showFullDetails}
                    disabled={isFullDetails || !isDraggingEnabled}>
                    <View pointerEvents={isFullDetails ? 'auto' : 'box-only'}>
                      {player}
                    </View>
                  </TouchableWithoutFeedback>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PanGestureHandler>
          <Animated.View
            style={[styles.bodyContainer, this.bodyAnimatedStyle]}
            pointerEvents={isFullDetails ? 'auto' : 'none'}
          />
        </Animated.View>
      </View>
    );
  }

  get pictureInPicturePlayerSize() {
    const { playerSize } = this.state;
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
  }

  get playerMaximumTopOffset() {
    const { height } = Dimensions.get('window');
    const bottomPlayerPadding = PICTURE_IN_PICTURE_PLAYER_PADDING + 100;

    return (
      height - this.pictureInPicturePlayerSize.height - bottomPlayerPadding
    );
  }

  get playerMaximumLeftOffset() {
    const { width } = Dimensions.get('window');
    return (
      width -
      this.pictureInPicturePlayerSize.width -
      PICTURE_IN_PICTURE_PLAYER_PADDING
    );
  }

  get playerPictureInPictureScale() {
    const { width } = Dimensions.get('window');
    return this.pictureInPicturePlayerSize.width / width;
  }

  get playerDragYPosition() {
    const { isFullDetails } = this.state;
    return Animated.add(
      this.touchOnPlayerY,
      new Animated.Value(isFullDetails ? 0 : this.playerMaximumTopOffset)
    );
  }

  get playerSwipeAwayStyle() {
    const smallPlayerWidth = this.pictureInPicturePlayerSize.width;

    return {
      opacity: this.touchOnPlayerX.interpolate({
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
          translateX: this.touchOnPlayerX.interpolate({
            inputRange: [-smallPlayerWidth, 0, smallPlayerWidth],
            outputRange: [
              -(smallPlayerWidth * this.playerPictureInPictureScale),
              0,
              smallPlayerWidth * this.playerPictureInPictureScale,
            ],
          }),
        },
      ],
    };
  }

  get playerPositionOffsetBecauseOfScale() {
    const { playerSize } = this.state;
    return {
      x:
        (playerSize.width * this.playerPictureInPictureScale -
          playerSize.width) /
        2,
      y:
        (playerSize.height * this.playerPictureInPictureScale -
          playerSize.height) /
        2,
    };
  }

  get playerAnimatedStyle() {
    return {
      transform: [
        {
          translateX: this.playerDragYPosition.interpolate({
            extrapolate: 'clamp',
            inputRange: [0, this.playerMaximumTopOffset],
            outputRange: [
              0,
              this.playerMaximumLeftOffset +
                this.playerPositionOffsetBecauseOfScale.x,
            ],
          }),
        },
        {
          translateY: this.playerDragYPosition.interpolate({
            extrapolate: 'clamp',
            inputRange: [0, this.playerMaximumTopOffset],
            outputRange: [
              0,
              this.playerMaximumTopOffset +
                this.playerPositionOffsetBecauseOfScale.y,
            ],
          }),
        },
        {
          scale: this.playerDragYPosition.interpolate({
            extrapolate: 'clamp',
            inputRange: [0, this.playerMaximumTopOffset],
            outputRange: [1, this.playerPictureInPictureScale],
          }),
        },
      ],
    };
  }

  get bodyAnimatedStyle() {
    const { playerSize } = this.state;
    const playerSizeDifferenceAfterScale =
      playerSize.height - this.pictureInPicturePlayerSize.height;

    return {
      opacity: this.playerDragYPosition.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, this.playerMaximumTopOffset],
        outputRange: [VISIBLE, INVISIBLE],
      }),
      transform: [
        {
          translateY: this.playerDragYPosition.interpolate({
            extrapolate: 'clamp',
            inputRange: [0, this.playerMaximumTopOffset],
            outputRange: [
              0,
              this.playerMaximumTopOffset - playerSizeDifferenceAfterScale,
            ],
          }),
        },
        {
          translateX: this.playerDragYPosition.interpolate({
            extrapolate: 'clamp',
            inputRange: [0, this.playerMaximumTopOffset],
            outputRange: [0, this.playerMaximumLeftOffset],
          }),
        },
      ],
    };
  }

  get topSafeAreaStyle() {
    return [
      styles.topSafeArea,
      {
        opacity: this.playerDragYPosition.interpolate({
          extrapolate: 'clamp',
          inputRange: [
            0,
            this.playerMaximumTopOffset * SAFE_AREA_OPACITY_DROP_OFF_PERCENTAGE,
          ],
          outputRange: [VISIBLE, INVISIBLE],
        }),
      },
    ];
  }

  onPlayerVerticalDragStateChange({
    nativeEvent,
  }: PanGestureHandlerGestureEvent) {
    const { isFullDetails } = this.state;

    if (nativeEvent.state === PanState.END) {
      const transitionThreshold =
        this.playerMaximumTopOffset *
        PICTURE_IN_PICTURE_TRANSITION_THRESHOLD_PERCENTAGE;
      const activateFullDetails =
        (isFullDetails && nativeEvent.translationY < transitionThreshold) ||
        (!isFullDetails &&
          Math.abs(nativeEvent.translationY) > transitionThreshold);
      this.setShowFullDetails(activateFullDetails);
    }
  }

  onPlayerSwipeAwayStateChange({ nativeEvent }: PanGestureHandlerGestureEvent) {
    if (nativeEvent.state === PanState.END) {
      this.setState({ isDraggingEnabled: false }, () => {
        const { width } = Dimensions.get('window');
        const swipeAwayDistance =
          this.pictureInPicturePlayerSize.width *
          SWIPE_AWAY_THRESHOLD_PERCENTAGE;
        const isSwipeAwaySuccesful =
          Math.abs(nativeEvent.translationX) > swipeAwayDistance;
        if (isSwipeAwaySuccesful) {
          Animated.timing(this.touchOnPlayerX, {
            duration: ANIMATION_LENGTH,
            toValue:
              (nativeEvent.translationX > 0 ? 1 : -1) *
              width *
              SWIPE_AWAY_SPEED_MULTIPLIER,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.timing(this.touchOnPlayerX, {
            duration: ANIMATION_LENGTH,
            toValue: 0,
            useNativeDriver: true,
          }).start(() => {
            this.setState({ isDraggingEnabled: true });
          });
        }
      });
    }
  }

  setShowFullDetails(activateFullDetails: boolean) {
    this.setState({ isDraggingEnabled: false }, () => {
      const { isFullDetails } = this.state;
      const isFullDetailsYOffset = isFullDetails
        ? 0
        : this.playerMaximumTopOffset;
      Animated.timing(this.touchOnPlayerY, {
        duration: ANIMATION_LENGTH,
        toValue:
          (activateFullDetails ? 0 : this.playerMaximumTopOffset) -
          isFullDetailsYOffset,
        useNativeDriver: true,
      }).start(() => {
        this.setState({
          isDraggingEnabled: true,
          isFullDetails: activateFullDetails,
        });
      });
    });
  }

  onPlayerLayout({ nativeEvent: { layout } }: LayoutChangeEvent) {
    this.setState({
      playerSize: {
        height: layout.height,
        width: layout.width,
      },
    });
  }
}
