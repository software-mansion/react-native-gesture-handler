export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
} as const;

export const CornerDirections = {
  UP_RIGHT: Directions.UP | Directions.RIGHT,
  DOWN_RIGHT: Directions.DOWN | Directions.RIGHT,
  UP_LEFT: Directions.UP | Directions.LEFT,
  DOWN_LEFT: Directions.DOWN | Directions.LEFT,
} as const;

/* eslint-disable @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value */
export type Directions = (typeof Directions)[keyof typeof Directions];
export type CornerDirections =
  (typeof CornerDirections)[keyof typeof CornerDirections];
/* eslint-enable @typescript-eslint/no-redeclare */
