export const ActionType = {
  REANIMATED_WORKLET: 1,
  NATIVE_ANIMATED_EVENT: 2,
  JS_FUNCTION_OLD_API: 3,
  JS_FUNCTION_NEW_API: 4,
  NATIVE_DETECTOR: 5,
  LOGIC_DETECTOR: 6,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export function isV3Api(actionType: ActionType | null): boolean {
  return (
    actionType === ActionType.NATIVE_DETECTOR ||
    actionType === ActionType.LOGIC_DETECTOR
  );
}
