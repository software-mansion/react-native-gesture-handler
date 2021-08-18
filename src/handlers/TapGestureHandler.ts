import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const tapGestureHandlerProps = [
  'maxDurationMs',
  'maxDelayMs',
  'numberOfTaps',
  'maxDeltaX',
  'maxDeltaY',
  'maxDist',
  'minPointers',
] as const;

export type TapGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface TapGestureConfig {
  numberOfTaps?: number;
  maxDist?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
}

export interface TapGestureHandlerProps
  extends BaseGestureHandlerProps<TapGestureHandlerEventPayload>,
    TapGestureConfig {}

export type TapGestureHandler = typeof TapGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const TapGestureHandler = createHandler<
  TapGestureHandlerProps,
  TapGestureHandlerEventPayload
>({
  name: 'TapGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...tapGestureHandlerProps,
  ] as const,
  config: {},
});
