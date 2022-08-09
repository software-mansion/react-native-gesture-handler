import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ANIMATE_TO_NEW_PLACE_DURATION, getSizeConstants } from './constants';
import Draggable from './Draggable';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface DraggableItemData<T> {
  data: T;
  isActive: boolean;
  draggingActive: boolean;
  tileSize: number;
}

interface DragAndDropProps<T> {
  items: T[];
  itemsInRowCount: number;
  onOrderUpdate: (items: T[]) => void;
  renderItem: (data: DraggableItemData<T>) => React.ReactElement;
  rowGap?: number;
  columnGap: number;
}

function DragAndDrop<T extends { id: string }>({
  items,
  renderItem,
  onOrderUpdate,
  itemsInRowCount,
  columnGap,
  rowGap = columnGap,
}: DragAndDropProps<T>) {
  const { TILE_SIZE, TILE_WITH_MARGIN_SIZE, ROW_HEIGHT } = getSizeConstants({
    itemsInRowCount,
    rowGap,
    columnGap,
  });

  const PlaceholderComponent = { id: 'dnd-placeholder' } as T;
  const [data, setData] = useState(items);
  const [dragActive, setDragActive] = useState(false);
  const [activeElementId, setActiveElementId] = useState<null | string>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<null | number>(null);
  const activeElementTranslation = {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };
  // used to calculate position of currently dragged element in relation to drag start position
  // we are using dragged element center as calculations point - then we just add translationX/Y from gesture
  // this way we can easily calculate proper index based of current gesture position
  const [activeElementInitialPosition, setActiveElementInitialPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const updateDataOnDragEnd = () => {
    const newData = [...data];
    const activeElementIndex = getActiveElementIndex();
    if (activeElementIndex !== null && placeholderIndex !== null) {
      newData.splice(activeElementIndex, 1);
      const activeElement = getActiveElement();
      if (activeElement) {
        newData.splice(placeholderIndex, 0, activeElement);
      }
    }
    setData(newData);
    onOrderUpdate(newData);
  };

  const enableDragging = (id: string) => {
    setActiveElementId(id);
    setDragActive(true);
  };

  const updateDataOnEnd = () => {
    setDragActive(false);
    setActiveElementId(null);
    updateDataOnDragEnd();
    activeElementTranslation.x.value = 0;
    activeElementTranslation.y.value = 0;
  };

  const onDragEnd = () => {
    const newPlacePosition = getItemCenterPosition(placeholderIndex);
    if (newPlacePosition !== null) {
      activeElementTranslation.x.value = withTiming(
        newPlacePosition.x - activeElementInitialPosition.x,
        { duration: ANIMATE_TO_NEW_PLACE_DURATION }
      );
      activeElementTranslation.y.value = withTiming(
        newPlacePosition.y - activeElementInitialPosition.y,
        { duration: ANIMATE_TO_NEW_PLACE_DURATION }
      );
      // we want to wait till animation to a new place will finish
      // I think there's a bug in RN2 with how withTiming callback works so we can't use it :(
      setTimeout(updateDataOnEnd, ANIMATE_TO_NEW_PLACE_DURATION + 20);
    }
  };

  const getActiveElement = () => {
    return data.find((el) => el.id === activeElementId);
  };

  const getActiveElementIndex = () => {
    const index = data.findIndex((el) => el.id === activeElementId);
    return index !== -1 ? index : null;
  };

  const getItemCenterPosition = (index: number | null) => {
    if (index === null) {
      return null;
    }
    const row = Math.floor(index / itemsInRowCount) + 1;

    const yCenterPosition = row * ROW_HEIGHT - TILE_SIZE / 2;

    const elementsBeforeCount = (row - 1) * itemsInRowCount;
    const xCenterPosition =
      TILE_WITH_MARGIN_SIZE * (index + 1 - elementsBeforeCount) - TILE_SIZE / 2;

    return { x: xCenterPosition, y: yCenterPosition };
  };

  const setActiveElementPositionFromIndex = () => {
    const index = getActiveElementIndex();
    const activeElementCenterPosition = getItemCenterPosition(index);

    if (activeElementCenterPosition) {
      setActiveElementInitialPosition(activeElementCenterPosition);
    }
  };

  const setPlaceholderIndexFromGesturePosition = ({
    translationX,
    translationY,
  }: PanGestureHandlerEventPayload) => {
    const x = activeElementInitialPosition.x + translationX;
    const y = activeElementInitialPosition.y + translationY;

    const itemsCountInRowsAbove = Math.max(
      0,
      Math.floor(y / ROW_HEIGHT) * itemsInRowCount
    );

    const itemsCountInColumnBefore = Math.max(
      0,
      Math.floor(x / TILE_WITH_MARGIN_SIZE)
    );

    const newPlaceholderIndex = Math.min(
      Math.max(0, itemsCountInRowsAbove + itemsCountInColumnBefore),
      data.length
    );

    if (newPlaceholderIndex !== placeholderIndex) {
      LayoutAnimation.easeInEaseOut();
      setPlaceholderIndex(newPlaceholderIndex);
    }
  };

  useEffect(() => {
    // react to activeElement change
    setActiveElementPositionFromIndex();
    setPlaceholderIndex(getActiveElementIndex());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeElementId]);

  const onPositionUpdate = (e: PanGestureHandlerEventPayload) => {
    const { translationX, translationY } = e;

    setPlaceholderIndexFromGesturePosition(e);
    activeElementTranslation.x.value = withSpring(translationX, { mass: 0.5 });
    activeElementTranslation.y.value = withSpring(translationY, { mass: 0.5 });
  };

  const onUpdateHandler = dragActive
    ? onPositionUpdate
    : () => {
        /* empty handler */
      };

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate(onUpdateHandler)
    .onEnd(onDragEnd);
  const tapEndedGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_, isFinished) => {
      if (isFinished) {
        updateDataOnEnd();
      }
    });

  const _renderItems = () => {
    const newData = [...data];

    const activeElementIndex = getActiveElementIndex();
    if (placeholderIndex !== null) {
      if (activeElementIndex !== null) {
        newData.splice(activeElementIndex, 1);
      }
      newData.splice(placeholderIndex, 0, PlaceholderComponent);
      const activeElement = getActiveElement();
      if (activeElement) {
        newData.push(activeElement);
      }
    }
    return newData.map(_renderItem);
  };

  const _renderItem = (item: T) => {
    const isActive = activeElementId === item.id;
    return (
      <Draggable
        key={item.id}
        id={item.id}
        onLongPress={enableDragging}
        enabled={dragActive}
        onPositionUpdate={onPositionUpdate}
        isActive={activeElementId === item.id}
        translation={activeElementTranslation}
        dragGesture={dragGesture}
        tapEndGesture={tapEndedGesture}
        tileSize={TILE_SIZE}
        rowGap={rowGap}
        columnGap={columnGap}
        position={{
          x: activeElementInitialPosition.x - TILE_SIZE / 2,
          y: activeElementInitialPosition.y - TILE_SIZE / 2,
        }}>
        {renderItem({
          data: item,
          isActive,
          draggingActive: dragActive,
          tileSize: TILE_SIZE,
        })}
      </Draggable>
    );
  };

  return (
    <GestureDetector gesture={Gesture.Exclusive(dragGesture, tapEndedGesture)}>
      <View
        style={[
          styles.container,
          { paddingHorizontal: columnGap / 2, paddingVertical: rowGap / 2 },
        ]}>
        {_renderItems()}
      </View>
    </GestureDetector>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent', // needed for gestures to work on android
  },
});

export default DragAndDrop;
