import { firstArrayValues, lastArrayValues } from './web/utils';

const RIGHT = 1;
const LEFT = 2;
const UP = 4;
const DOWN = 8;

// public interface
export const Directions = {
  RIGHT: RIGHT,
  LEFT: LEFT,
  UP: UP,
  DOWN: DOWN,
} as const;

// internal interface
export const CompositeDirections = {
  RIGHT: RIGHT,
  LEFT: LEFT,
  UP: UP,
  DOWN: DOWN,
  UP_RIGHT: UP | RIGHT,
  DOWN_RIGHT: DOWN | RIGHT,
  UP_LEFT: UP | LEFT,
  DOWN_LEFT: DOWN | LEFT,
} as const;

export const axialDirectionsList = firstArrayValues(
  Object.values(CompositeDirections),
  4
);

export const diagnalDirectionsList = lastArrayValues(
  Object.values(CompositeDirections),
  4
);

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type Directions = typeof Directions[keyof typeof Directions];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type CompositeDirections =
  typeof CompositeDirections[keyof typeof CompositeDirections];
