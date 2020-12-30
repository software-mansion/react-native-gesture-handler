// TODO use State from RNModule

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
} as const;

// It is needed for backwards compability, since it can be used as a type and a value
// eslint-disable-next-line no-redeclare
export type State = typeof State[keyof typeof State];
