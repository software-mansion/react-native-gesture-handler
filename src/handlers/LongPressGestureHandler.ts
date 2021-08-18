import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const longPressGestureHandlerProps = [
  'minDurationMs',
  'maxDist',
] as const;

export type LongPressGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  duration: number;
};

export interface LongPressGestureConfig {
  minDurationMs?: number;
  maxDist?: number;
}

export interface LongPressGestureHandlerProps
  extends BaseGestureHandlerProps<LongPressGestureHandlerEventPayload>,
    LongPressGestureConfig {}

export type LongPressGestureHandler = typeof LongPressGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const LongPressGestureHandler = createHandler<
  LongPressGestureHandlerProps,
  LongPressGestureHandlerEventPayload
>({
  name: 'LongPressGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...longPressGestureHandlerProps,
  ] as const,
  config: {},
});
