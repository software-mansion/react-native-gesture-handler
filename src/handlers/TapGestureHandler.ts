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

export interface TapGestureHandlerProps
  extends BaseGestureHandlerProps<TapGestureHandlerEventPayload> {
  minPointers?: number;
  maxDurationMs?: number;
  maxDelayMs?: number;
  numberOfTaps?: number;
  maxDeltaX?: number;
  maxDeltaY?: number;
  maxDist?: number;
}

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
