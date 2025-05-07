import React from 'react';
import DragAndDrop, { DraggableItemData } from './DragAndDrop';
import Tile, { ColorTile } from './Tile';

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

const COLORS_ITEMS = COLORS.map((c) => ({
  id: c,
  color: c,
}));

const Example = () => {
  const handleOrderChange = (_items: ColorTile[]) => {
    // do stuff with newly ordered items
  };

  const renderItem = ({
    data,
    isActive,
    draggingActive,
    tileSize,
  }: DraggableItemData<ColorTile>) => {
    return (
      <Tile
        isActive={isActive}
        draggingActive={draggingActive}
        data={data}
        tileSize={tileSize}
      />
    );
  };

  return (
    <DragAndDrop
      items={COLORS_ITEMS}
      itemsInRowCount={4}
      columnGap={20}
      rowGap={20}
      renderItem={renderItem}
      onOrderUpdate={handleOrderChange}
    />
  );
};

export default Example;
