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
  'pink',
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
  enabled: boolean;
  isActive: boolean;
  translation: AnimatedPostion;
  dragGesture: any;
}

const Draggable: FunctionComponent<DraggableProps> = ({
  children,
  onLongPress,
  isActive,
  translation,
  dragGesture,
}) => {
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
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      measurePosition();
    })
    .simultaneousWithExternalGesture(dragGesture);

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
    <GestureDetector gesture={tapGesture}>
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
  dragEnabled: boolean;
  isActive?: boolean;
  onPositionUpdate: (e: PanGestureHandlerEventPayload) => void;
  dragGesture: any;
  translation: AnimatedPostion;
}

const Tile: FunctionComponent<TileProps> = ({
  id,
  color,
  setDragEnabled,
  dragEnabled,
  isActive,
  translation,
  dragGesture,
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
          rotateZ: `${interpolate(
            shakeAnimation.value,
            [0, 0.3, 0.7, 1],
            [0, -5, 5, 0]
          )}deg`,
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
      enabled={dragEnabled}
      isActive={!!isActive}
      translation={translation}
      dragGesture={dragGesture}>
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
  const [data, setData] = useState(COLORS);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [activeElement, setActiveElement] = useState<null | string>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<null | number>(null);
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

  const updateDataOnDragEnd = () => {
    const newData = [...data];
    const activeElementIndex = getActiveElementIndex();

    if (
      activeElementIndex !== null &&
      placeholderIndex !== null &&
      activeElement
    ) {
      newData.splice(activeElementIndex, 1);
      newData.splice(placeholderIndex, 0, activeElement);
    }
    setData(newData);
  };

  const enableDragging = (id: string) => {
    setActiveElement(id);
    setDragEnabled(true);
  };

  const disableDragging = () => {
    updateDataOnDragEnd();
    setActiveElement(null);
    setDragEnabled(false);
    activeElementTranslation.x.value = 0;
    activeElementTranslation.y.value = 0;
  };

  const getActiveElementIndex = () => {
    const index = data.findIndex((c) => c === activeElement);
    return index !== -1 ? index : null;
  };

  const renderTiles = () => {
    const newData = [...data];

    const activeElementIndex = getActiveElementIndex();
    if (placeholderIndex !== null) {
      if (activeElementIndex !== null) {
        newData.splice(activeElementIndex, 1);
      }
      newData.splice(placeholderIndex, 0, 'transparent');
      if (activeElement) {
        newData.push(activeElement);
      }
    }
    return newData.map(renderTile);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateActiveElementPositionFromIndex = (index: number | null) => {
    if (!index) {
      return;
    }
    const row = Math.floor((index + 1) / TILES_IN_ROW) + 1;

    const activeElementCenterPointY = row * ROW_HEIGHT - TILE_SIZE / 2;

    const elementsBeforeCount = (row - 1) * TILES_IN_ROW;
    const activeElementCenterPointX =
      TILE_WITH_MARGIN * (index + 1 - elementsBeforeCount) - TILE_SIZE / 2;

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
    const index = Math.min(
      elementsBeforeAbove + elemetnsBeforeInRow,
      data.length
    );

    if (index !== placeholderIndex) {
      LayoutAnimation.easeInEaseOut();
      setPlaceholderIndex(index);
    }
  };

  useEffect(() => {
    // react to activeElement change
    calculateActiveElementPositionFromIndex(getActiveElementIndex());
    setPlaceholderIndex(getActiveElementIndex());
  }, [activeElement]);

  const onPositionUpdate = (e: PanGestureHandlerEventPayload) => {
    const { translationX, translationY } = e;

    calculatePlaceholderIndexFromPosition(e);
    activeElementTranslation.x.value = withSpring(translationX, { mass: 0.5 });
    activeElementTranslation.y.value = withSpring(translationY, { mass: 0.5 });
  };

  const onUpdateHandler = dragEnabled
    ? onPositionUpdate
    : () => {
        /* empty handler */
      };

  const dragGesture = Gesture.Pan()
    .onUpdate(onUpdateHandler)
    .onEnd(() => {
      if (!dragEnabled) return;
      disableDragging();
    });

  const tapEndedGesture = Gesture.Tap().onEnd(disableDragging);
  const renderTile = (color: string) => {
    return (
      <Tile
        id={color}
        isActive={activeElement === color}
        key={color}
        color={color}
        dragEnabled={dragEnabled}
        setDragEnabled={enableDragging}
        onPositionUpdate={onPositionUpdate}
        translation={activeElementTranslation}
        dragGesture={dragGesture}
      />
    );
  };

  return (
    <GestureDetector
      gesture={Gesture.Simultaneous(dragGesture, tapEndedGesture)}>
      <View style={styles.container}>{renderTiles()}</View>
    </GestureDetector>
  );
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
