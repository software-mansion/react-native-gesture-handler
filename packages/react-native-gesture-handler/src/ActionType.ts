export const ActionType = {
  REANIMATED_WORKLET: 1,
  NATIVE_ANIMATED_EVENT: 2,
  JS_FUNCTION_OLD_API: 3,
  JS_FUNCTION_NEW_API: 4,
  NATIVE_DETECTOR: 5,
  NATIVE_DETECTOR_ANIMATED_EVENT: 6,
} as const;

export function isNativeDetectorActionType(type: ActionType | null): boolean {
  return (
    type === ActionType.NATIVE_ANIMATED_EVENT ||
    type === ActionType.NATIVE_DETECTOR_ANIMATED_EVENT
  );
}

export function isAnimatedActionType(type: ActionType | null): boolean {
  return (
    type === ActionType.NATIVE_DETECTOR ||
    type === ActionType.NATIVE_DETECTOR_ANIMATED_EVENT
  );
}

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; it can be used as a type and as a value
export type ActionType = (typeof ActionType)[keyof typeof ActionType];
