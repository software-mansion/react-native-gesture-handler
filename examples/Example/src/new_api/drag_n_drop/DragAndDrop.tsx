import React, { useEffect, useState } from 'react';
import { LayoutAnimation, StyleSheet, View, ViewStyle } from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { getSizeConstants } from './constants';
import Draggable from './Draggable';

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
  containerStyle?: ViewStyle;
}

function DragAndDrop<T extends { id: string }>({
  items,
  renderItem,
  containerStyle,
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

  const PlaceholderComponent = { id: 'dnd-transparent' } as T;
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
    if (activeElementIndex !== null && placeholderIndex !== null) {
      newData.splice(activeElementIndex, 1);
      const activeElement = getActiveElementById();
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

  const disableDragging = () => {
    if (!dragActive) return;
    updateDataOnDragEnd();
    setActiveElementId(null);
    setDragActive(false);
    activeElementTranslation.x.value = 0;
    activeElementTranslation.y.value = 0;
  };

  const getActiveElementById = () => {
    return data.find((el) => el.id === activeElementId);
  };

  const getActiveElementIndexById = () => {
    return data.findIndex((el) => el.id === activeElementId);
  };

  const getActiveElementIndex = () => {
    const index = getActiveElementIndexById();
    return index !== -1 ? index : null;
  };

  const _renderItems = () => {
    const newData = [...data];

    const activeElementIndex = getActiveElementIndex();
    if (placeholderIndex !== null) {
      if (activeElementIndex !== null) {
        newData.splice(activeElementIndex, 1);
      }
      newData.splice(placeholderIndex, 0, PlaceholderComponent);
      const activeElement = getActiveElementById();
      if (activeElement) {
        newData.push(activeElement);
      }
    }
    return newData.map(_renderItem);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateActiveElementPositionFromIndex = (index: number | null) => {
    if (!index) {
      return;
    }
    const row = Math.floor(index / itemsInRowCount) + 1;

    const activeElementCenterPointY = row * ROW_HEIGHT - TILE_SIZE / 2;

    const elementsBeforeCount = (row - 1) * itemsInRowCount;
    const activeElementCenterPointX =
      TILE_WITH_MARGIN_SIZE * (index + 1 - elementsBeforeCount) - TILE_SIZE / 2;

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
    calculateActiveElementPositionFromIndex(getActiveElementIndex());
    setPlaceholderIndex(getActiveElementIndex());
  }, [activeElementId]);

  const onPositionUpdate = (e: PanGestureHandlerEventPayload) => {
    const { translationX, translationY } = e;

    calculatePlaceholderIndexFromPosition(e);
    activeElementTranslation.x.value = withSpring(translationX, { mass: 0.5 });
    activeElementTranslation.y.value = withSpring(translationY, { mass: 0.5 });
  };

  const onUpdateHandler = dragActive
    ? onPositionUpdate
    : () => {
        /* empty handler */
      };

  const dragGesture = Gesture.Pan()
    .onUpdate(onUpdateHandler)
    .onEnd(() => {
      if (!dragActive) return;
      disableDragging();
    });

  const tapEndedGesture = Gesture.Tap().onEnd(disableDragging);

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
        tileSize={TILE_SIZE}
        rowGap={rowGap}
        columnGap={columnGap}>
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
    <GestureDetector
      gesture={Gesture.Simultaneous(dragGesture, tapEndedGesture)}>
      <View style={containerStyle}>
        <View
          style={[
            styles.container,
            { paddingHorizontal: columnGap / 2, paddingVertical: rowGap / 2 },
          ]}>
          {_renderItems()}
        </View>
      </View>
    </GestureDetector>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default DragAndDrop;
