const RIGHT = 1;
const LEFT = 2;
const UP = 4;
const DOWN = 8;

// Public interface
export const Directions = {
  RIGHT: RIGHT,
  LEFT: LEFT,
  UP: UP,
  DOWN: DOWN,
} as const;

// Internal interface
export const DiagonalDirections = {
  UP_RIGHT: UP | RIGHT,
  DOWN_RIGHT: DOWN | RIGHT,
  UP_LEFT: UP | LEFT,
  DOWN_LEFT: DOWN | LEFT,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type Directions = (typeof Directions)[keyof typeof Directions];
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DiagonalDirections =
  (typeof DiagonalDirections)[keyof typeof DiagonalDirections];
