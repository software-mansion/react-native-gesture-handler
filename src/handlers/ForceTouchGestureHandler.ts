import React, { PropsWithChildren } from 'react';
import { tagMessage } from '../utils';
import PlatformConstants from '../PlatformConstants';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';
import type { ForceTouchGestureHandlerEventPayload } from './GestureHandlerEventPayload';

export const forceTouchGestureHandlerProps = [
  'minForce',
  'maxForce',
  'feedbackOnActivation',
] as const;

// implicit `children` prop has been removed in @types/react^18.0.0
class ForceTouchFallback extends React.Component<PropsWithChildren<unknown>> {
  static forceTouchAvailable = false;
  componentDidMount() {
    console.warn(
      tagMessage(
        'ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase'
      )
    );
  }
  render() {
    return this.props.children;
  }
}

export interface ForceTouchGestureConfig {
  /**
   *
   * A minimal pressure that is required before handler can activate. Should be a
   * value from range `[0.0, 1.0]`. Default is `0.2`.
   */
  minForce?: number;

  /**
   * A maximal pressure that could be applied for handler. If the pressure is
   * greater, handler fails. Should be a value from range `[0.0, 1.0]`.
   */
  maxForce?: number;

  /**
   * Boolean value defining if haptic feedback has to be performed on
   * activation.
   */
  feedbackOnActivation?: boolean;
}

export interface ForceTouchGestureHandlerProps
  extends BaseGestureHandlerProps<ForceTouchGestureHandlerEventPayload>,
    ForceTouchGestureConfig {}

export type ForceTouchGestureHandler = typeof ForceTouchGestureHandler & {
  forceTouchAvailable: boolean;
};

export const forceTouchHandlerName = 'ForceTouchGestureHandler';

// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const ForceTouchGestureHandler = PlatformConstants?.forceTouchAvailable
  ? createHandler<
      ForceTouchGestureHandlerProps,
      ForceTouchGestureHandlerEventPayload
    >({
      name: forceTouchHandlerName,
      allowedProps: [
        ...baseGestureHandlerProps,
        ...forceTouchGestureHandlerProps,
      ] as const,
      config: {},
    })
  : ForceTouchFallback;

(ForceTouchGestureHandler as ForceTouchGestureHandler).forceTouchAvailable =
  PlatformConstants?.forceTouchAvailable || false;
