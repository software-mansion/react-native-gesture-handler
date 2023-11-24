import React, { PropsWithChildren } from 'react';
import { tagMessage } from '../utils';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';
import { isMacOS } from '../PlatformChecker';

export const nativeViewGestureHandlerProps = [
  'shouldActivateOnStart',
  'disallowInterruption',
] as const;

class NativeViewFallback extends React.Component<PropsWithChildren<unknown>> {
  static forceTouchAvailable = false;
  componentDidMount() {
    console.warn(
      tagMessage('NativeViewGestureHandler is not available on this platform.')
    );
  }
  render() {
    return this.props.children;
  }
}

export interface NativeViewGestureConfig {
  /**
   * Android only.
   *
   * Determines whether the handler should check for an existing touch event on
   * instantiation.
   */
  shouldActivateOnStart?: boolean;

  /**
   * When `true`, cancels all other gesture handlers when this
   * `NativeViewGestureHandler` receives an `ACTIVE` state event.
   */
  disallowInterruption?: boolean;
}

export interface NativeViewGestureHandlerProps
  extends BaseGestureHandlerProps<NativeViewGestureHandlerPayload>,
    NativeViewGestureConfig {}

export type NativeViewGestureHandlerPayload = {
  /**
   * True if gesture was performed inside of containing view, false otherwise.
   */
  pointerInside: boolean;
};

export const nativeViewProps = [
  ...baseGestureHandlerProps,
  ...nativeViewGestureHandlerProps,
] as const;

export const nativeViewHandlerName = 'NativeViewGestureHandler';

export type NativeViewGestureHandler = typeof NativeViewGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const NativeViewGestureHandler = !isMacOS()
  ? createHandler<
      NativeViewGestureHandlerProps,
      NativeViewGestureHandlerPayload
    >({
      name: nativeViewHandlerName,
      allowedProps: nativeViewProps,
      config: {},
    })
  : NativeViewFallback;
