const RIGHT = 1;
const LEFT = 2;
const UP = 4;
const DOWN = 8;

// Those need to be constant values rather than expressions for TypeScript not
// to type them as 'number'.
const UP_RIGHT = 5; // UP | RIGHT
const DOWN_RIGHT = 9; // DOWN | RIGHT
const UP_LEFT = 6; // UP | LEFT
const DOWN_LEFT = 10; // DOWN | LEFT

// Public interface
export const Directions = {
  RIGHT,
  LEFT,
  UP,
  DOWN,
} as const;

// Internal interface
export const DiagonalDirections = {
  UP_RIGHT,
  DOWN_RIGHT,
  UP_LEFT,
  DOWN_LEFT,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type Directions = (typeof Directions)[keyof typeof Directions];
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DiagonalDirections =
  (typeof DiagonalDirections)[keyof typeof DiagonalDirections];
