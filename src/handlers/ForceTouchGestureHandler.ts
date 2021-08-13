import React from 'react';
import PlatformConstants from '../PlatformConstants';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const forceTouchGestureHandlerProps = [
  'minForce',
  'maxForce',
  'feedbackOnActivation',
] as const;

class ForceTouchFallback extends React.Component {
  static forceTouchAvailable = false;
  componentDidMount() {
    console.warn(
      'ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase'
    );
  }
  render() {
    return this.props.children;
  }
}

export type ForceTouchGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  force: number;
};

export interface ForceTouchGestureHandlerProps
  extends BaseGestureHandlerProps<ForceTouchGestureHandlerEventPayload> {
  minForce?: number;
  maxForce?: number;
  feedbackOnActivation?: boolean;
}

export type ForceTouchGestureHandler = typeof ForceTouchGestureHandler & {
  forceTouchAvailable: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const ForceTouchGestureHandler = PlatformConstants?.forceTouchAvailable
  ? createHandler<
      ForceTouchGestureHandlerProps,
      ForceTouchGestureHandlerEventPayload
    >({
      name: 'ForceTouchGestureHandler',
      allowedProps: [
        ...baseGestureHandlerProps,
        ...forceTouchGestureHandlerProps,
      ] as const,
      config: {},
    })
  : ForceTouchFallback;

(ForceTouchGestureHandler as ForceTouchGestureHandler).forceTouchAvailable =
  PlatformConstants?.forceTouchAvailable || false;
