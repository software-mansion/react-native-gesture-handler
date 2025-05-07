import { Dimensions } from 'react-native';

export function getSizeConstants({
  itemsInRowCount,
  rowGap,
  columnGap,
}: {
  itemsInRowCount: number;
  rowGap: number;
  columnGap: number;
}) {
  const TILE_SIZE =
    (Dimensions.get('screen').width - (itemsInRowCount + 1) * columnGap) /
    itemsInRowCount;
  const TILE_WITH_MARGIN_SIZE = TILE_SIZE + columnGap;
  const ROW_HEIGHT = TILE_SIZE + rowGap;

  return {
    TILE_SIZE,
    TILE_WITH_MARGIN_SIZE,
    ROW_HEIGHT,
  };
}

export const ANIMATE_TO_NEW_PLACE_DURATION = 100;
