import React, { FunctionComponent, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const COLORS = [
  '#F94144',
  '#F3722C',
  '#F8961E',
  '#F9844A',
  '#F9C74F',
  '#90BE6D',
  '#43AA8B',
  '#4D908E',
  '#577590',
  '#277DA1',
];

interface DraggableProps {
  onLongPress: () => void;
  onPressEnd: () => void;
  onPositionUpdate: (e: any) => void;
  enabled: boolean;
}

const Draggable: FunctionComponent<DraggableProps> = ({
  children,
  onLongPress,
  onPositionUpdate,
  onPressEnd,
  enabled,
}) => {
  const dragGesture = Gesture.Pan().enabled(enabled).onUpdate(onPositionUpdate);
  const tapGesture = Gesture.LongPress()
    .minDuration(1000)
    .onStart(onLongPress)
    .onEnd(onPressEnd);

  return (
    <GestureDetector gesture={Gesture.Simultaneous(dragGesture, tapGesture)}>
      {children}
    </GestureDetector>
  );
};

interface TileProps {
  color: string;
  setDragEnabled: () => void;
  setDragDisabled: () => void;
  dragEnabled: boolean;
}

const Tile: FunctionComponent<TileProps> = ({
  color,
  setDragEnabled,
  setDragDisabled,
  dragEnabled,
}) => {
  const shakeAnimation = useSharedValue(0);
  const tileScale = useSharedValue(1);
  const dragEnabledPrevious = useRef(dragEnabled);

  const animateDragEnabled = () => {
    shakeAnimation.value = withRepeat(
      withTiming(1, {
        duration: 150,
        easing: Easing.linear,
      }),
      3
    );
    tileScale.value = withTiming(0.9, {
      duration: 100,
    });
  };

  const animateDragDisabled = () => {
    tileScale.value = withTiming(1, {
      duration: 100,
    });
    shakeAnimation.value = 0;
  };

  useEffect(() => {
    if (dragEnabled && !dragEnabledPrevious.current) {
      animateDragEnabled();
    }
    if (!dragEnabled && dragEnabledPrevious.current) {
      animateDragDisabled();
    }
    dragEnabledPrevious.current = dragEnabled;
  }, [dragEnabled]);

  const tileStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: interpolate(
            shakeAnimation.value,
            [0, 0.3, 0.7, 1],
            [0, -0.05, 0.05, 0]
          ),
        },
        {
          scale: tileScale.value,
        },
      ],
    };
  });

  const onPositionUpdate = ({ translationX, translationY }) => {
    console.log(translationX, translationY);
  };

  return (
    <Draggable
      onLongPress={setDragEnabled}
      onPressEnd={setDragDisabled}
      enabled={dragEnabled}
      onPositionUpdate={onPositionUpdate}>
      <Animated.View
        style={[
          styles.tile,
          {
            backgroundColor: color,
          },
          tileStyle,
        ]}
      />
    </Draggable>
  );
};

const Example = () => {
  const [dragEnabled, setDragEnabled] = React.useState(false);
  const enableDragging = () => {
    setDragEnabled(true);
  };
  const disableDragging = () => {
    setDragEnabled(false);
  };

  const renderTile = (color: string) => (
    <Tile
      color={color}
      dragEnabled={dragEnabled}
      setDragEnabled={enableDragging}
      setDragDisabled={disableDragging}
    />
  );
  return <View style={styles.container}>{COLORS.map(renderTile)}</View>;
};

const MARGIN = 24;
const TILE_SIZE = (Dimensions.get('screen').width - 5 * MARGIN) / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: MARGIN,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 16,
    marginLeft: MARGIN,
    marginBottom: MARGIN,
  },
});

export default Example;
