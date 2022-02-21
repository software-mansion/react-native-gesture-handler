export const ActionType = {
  REANIMATED_WORKLET: 1,
  NATIVE_ANIMATED_EVENT: 2,
  JS_FUNCTION: 3,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type ActionType = typeof ActionType[keyof typeof ActionType];
