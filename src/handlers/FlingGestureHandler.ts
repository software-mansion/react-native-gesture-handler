import React, { PropsWithChildren } from 'react';
import { tagMessage } from '../utils';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';
import { isMacOS } from '../PlatformChecker';

export const flingGestureHandlerProps = [
  'numberOfPointers',
  'direction',
] as const;

class FlingFallback extends React.Component<PropsWithChildren<unknown>> {
  static forceTouchAvailable = false;
  componentDidMount() {
    console.warn(
      tagMessage('FlingGestureHandler is not available on this platform.')
    );
  }
  render() {
    return this.props.children;
  }
}

export type FlingGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};
export interface FlingGestureConfig {
  /**
   * Expressed allowed direction of movement. It's possible to pass one or many
   * directions in one parameter:
   *
   * ```js
   * direction={Directions.RIGHT | Directions.LEFT}
   * ```
   *
   * or
   *
   * ```js
   * direction={Directions.DOWN}
   * ```
   */
  direction?: number;

  /**
   * Determine exact number of points required to handle the fling gesture.
   */
  numberOfPointers?: number;
}

export interface FlingGestureHandlerProps
  extends BaseGestureHandlerProps<FlingGestureHandlerEventPayload>,
    FlingGestureConfig {}

export const flingHandlerName = 'FlingGestureHandler';

export type FlingGestureHandler = typeof FlingGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const FlingGestureHandler = isMacOS()
  ? createHandler<FlingGestureHandlerProps, FlingGestureHandlerEventPayload>({
      name: flingHandlerName,
      allowedProps: [
        ...baseGestureHandlerProps,
        ...flingGestureHandlerProps,
      ] as const,
      config: {},
    })
  : FlingFallback;
