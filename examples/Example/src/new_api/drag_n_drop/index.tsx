import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Dimensions, LayoutAnimation, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withTiming,
  withRepeat,
  Easing,
  withSpring,
} from 'react-native-reanimated';

// constants
const MARGIN = 24;
const TILES_IN_ROW = 4;
const TILE_SIZE =
  (Dimensions.get('screen').width - (TILES_IN_ROW + 1) * MARGIN) / TILES_IN_ROW;
const TILE_WITH_MARGIN = TILE_SIZE + MARGIN;
const ROW_HEIGHT = TILE_WITH_MARGIN; // just for ease of understanding

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

type AnimatedPostion = {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
};
interface DraggableProps {
  onLongPress: () => void;
  onPressEnd: () => void;
  onPositionUpdate: (e: PanGestureHandlerEventPayload) => void;
  enabled: boolean;
  isActive: boolean;
  translation: AnimatedPostion;
}

const Draggable: FunctionComponent<DraggableProps> = ({
  children,
  onLongPress,
  onPositionUpdate,
  onPressEnd,
  enabled,
  isActive,
  translation,
}) => {
  const dragGesture = Gesture.Pan()
    .enabled(true)
    .onUpdate(onPositionUpdate)
    .onEnd(() => {
      onPositionUpdate({
        translationX: 0,
        translationY: 0,
      } as PanGestureHandlerEventPayload);
    });

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const elementRef = useRef<Animated.View>(null);

  const measurePosition = () => {
    elementRef?.current?.measure((x: number, y: number) => {
      setPosition({ x, y });
      onLongPress();
    });
  };

  const tapGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      measurePosition();
    })
    .onEnd(onPressEnd);

  const translateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: isActive ? translation.x.value : 0,
        },
        {
          translateY: isActive ? translation.y.value : 0,
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(dragGesture, tapGesture)}>
      <Animated.View
        ref={elementRef}
        style={[
          isActive
            ? { ...styles.absolute, left: position.x, top: position.y }
            : {},
          translateStyle,
        ]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

interface TileProps {
  id: string;
  color: string;
  setDragEnabled: (id: string) => void;
  setDragDisabled: () => void;
  dragEnabled: boolean;
  isActive?: boolean;
  onPositionUpdate: (e: PanGestureHandlerEventPayload) => void;
  translation: AnimatedPostion;
}

const Tile: FunctionComponent<TileProps> = ({
  id,
  color,
  setDragEnabled,
  setDragDisabled,
  dragEnabled,
  onPositionUpdate,
  isActive,
  translation,
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
      -1
    );
    tileScale.value = withTiming(isActive ? 1.1 : 0.9, {
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

  const setDragEnabledForTile = () => {
    setDragEnabled(id);
  };

  return (
    <Draggable
      onLongPress={setDragEnabledForTile}
      onPressEnd={setDragDisabled}
      enabled={dragEnabled}
      onPositionUpdate={onPositionUpdate}
      isActive={!!isActive}
      translation={translation}>
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
  const [activeElement, setActiveElement] = React.useState<null | string>(null);
  const [placeholderIndex, setPlaceholderIndex] = React.useState<null | number>(
    null
  );
  const activeElementTranslation = {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };
  const [
    activeElementInitialPosition,
    setActiveElementInitialPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  const enableDragging = (id: string) => {
    setActiveElement(id);
    setDragEnabled(true);
  };
  const disableDragging = () => {
    setActiveElement(null);
    setDragEnabled(false);
  };

  const getActiveElementIndex = () => {
    const index = COLORS.findIndex((c) => c === activeElement);
    return index !== -1 ? index : null;
  };

  const renderTiles = () => {
    const colors = [...COLORS];

    if (placeholderIndex !== null) {
      const activeElementIndex = getActiveElementIndex();
      if (activeElementIndex && placeholderIndex >= activeElementIndex + 1) {
        // when moving active element to the right we need to skip activeElement in array as well - hence +1
        colors.splice(placeholderIndex + 1, 0, 'transparent');
      } else {
        colors.splice(placeholderIndex, 0, 'transparent');
      }
    }

    return colors.map(renderTile);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateActiveElementPositionFromIndex = () => {
    const activeElementIndex = getActiveElementIndex();
    if (!activeElementIndex) {
      return;
    }
    const row = Math.floor((activeElementIndex + 1) / TILES_IN_ROW) + 1;

    const activeElementCenterPointY = row * ROW_HEIGHT - TILE_SIZE / 2;

    const elementsBeforeCount = (row - 1) * TILES_IN_ROW;
    const activeElementCenterPointX =
      TILE_WITH_MARGIN * (activeElementIndex + 1 - elementsBeforeCount) -
      TILE_SIZE / 2;

    setActiveElementInitialPosition({
      x: activeElementCenterPointX,
      y: activeElementCenterPointY,
    });
  };

  const calculatePlaceholderIndexFromPosition = ({
    translationX,
    translationY,
  }: PanGestureHandlerEventPayload) => {
    const x = activeElementInitialPosition.x + translationX;
    const y = activeElementInitialPosition.y + translationY;

    const elementsBeforeAbove = Math.floor(y / ROW_HEIGHT) * TILES_IN_ROW;
    const elemetnsBeforeInRow = Math.floor(x / TILE_WITH_MARGIN);

    const index = elementsBeforeAbove + elemetnsBeforeInRow;

    if (index !== placeholderIndex) {
      LayoutAnimation.easeInEaseOut();
      setPlaceholderIndex(index);
    }
  };

  useEffect(() => {
    // react to activeElement change
    calculateActiveElementPositionFromIndex();
    setPlaceholderIndex(getActiveElementIndex());
  }, [activeElement]);

  const onPositionUpdate = (e: PanGestureHandlerEventPayload) => {
    const { translationX, translationY } = e;

    calculatePlaceholderIndexFromPosition(e);
    activeElementTranslation.x.value = withSpring(translationX, { mass: 0.5 });
    activeElementTranslation.y.value = withSpring(translationY, { mass: 0.5 });
  };

  const renderTile = (color: string) => {
    return (
      <Tile
        id={color}
        isActive={activeElement === color}
        key={color}
        color={color}
        dragEnabled={dragEnabled}
        setDragEnabled={enableDragging}
        setDragDisabled={disableDragging}
        onPositionUpdate={onPositionUpdate}
        translation={activeElementTranslation}
      />
    );
  };

  return <View style={styles.container}>{renderTiles()}</View>;
};
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
  absolute: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default Example;
