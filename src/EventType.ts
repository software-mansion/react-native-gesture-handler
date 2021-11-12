export const EventType = {
  UNDETERMINED: 0,
  POINTER_DOWN: 1,
  POINTER_MOVE: 2,
  POINTER_UP: 3,
  POINTER_CANCELLED: 4,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type EventType = typeof EventType[keyof typeof EventType];
