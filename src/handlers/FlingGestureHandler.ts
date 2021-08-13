import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const flingGestureHandlerProps = [
  'numberOfPointers',
  'direction',
] as const;

export type FlingGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export interface FlingGestureHandlerProps
  extends BaseGestureHandlerProps<FlingGestureHandlerEventPayload> {
  direction?: number;
  numberOfPointers?: number;
}

export type FlingGestureHandler = typeof FlingGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of this file
export const FlingGestureHandler = createHandler<
  FlingGestureHandlerProps,
  FlingGestureHandlerEventPayload
>({
  name: 'FlingGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...flingGestureHandlerProps,
  ] as const,
  config: {},
});
