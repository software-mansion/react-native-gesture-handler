import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const panGestureHandlerProps = [
  'activeOffsetY',
  'activeOffsetX',
  'failOffsetY',
  'failOffsetX',
  'minDist',
  'minVelocity',
  'minVelocityX',
  'minVelocityY',
  'minPointers',
  'maxPointers',
  'avgTouches',
  'enableTrackpadTwoFingerGesture',
] as const;

export const panGestureHandlerCustomNativeProps = [
  'activeOffsetYStart',
  'activeOffsetYEnd',
  'activeOffsetXStart',
  'activeOffsetXEnd',
  'failOffsetYStart',
  'failOffsetYEnd',
  'failOffsetXStart',
  'failOffsetXEnd',
] as const;

export type PanGestureHandlerEventPayload = {
  /**
   * X coordinate of the current position of the pointer (finger or a leading
   * pointer when there are multiple fingers placed) relative to the view
   * attached to the handler. Expressed in point units.
   */
  x: number;

  /**
   * Y coordinate of the current position of the pointer (finger or a leading
   * pointer when there are multiple fingers placed) relative to the view
   * attached to the handler. Expressed in point units.
   */
  y: number;

  /**
   * X coordinate of the current position of the pointer (finger or a leading
   * pointer when there are multiple fingers placed) relative to the root view.
   * The value is expressed in point units. It is recommended to use it instead
   * of `x` in cases when the original view can be transformed as an effect of
   * the gesture.
   */
  absoluteX: number;

  /**
   * Y coordinate of the current position of the pointer (finger or a leading
   * pointer when there are multiple fingers placed) relative to the root view.
   * The value is expressed in point units. It is recommended to use it instead
   * of `y` in cases when the original view can be transformed as an
   * effect of the gesture.
   */
  absoluteY: number;

  /**
   * Translation of the pan gesture along X axis accumulated over the time of
   * the gesture. The value is expressed in the point units.
   */
  translationX: number;

  /**
   * Translation of the pan gesture along Y axis accumulated over the time of
   * the gesture. The value is expressed in the point units.
   */
  translationY: number;

  /**
   * Velocity of the pan gesture along the X axis in the current moment. The
   * value is expressed in point units per second.
   */
  velocityX: number;

  /**
   * Velocity of the pan gesture along the Y axis in the current moment. The
   * value is expressed in point units per second.
   */
  velocityY: number;
};

export interface PanGestureHandlerProps
  extends BaseGestureHandlerProps<PanGestureHandlerEventPayload> {
  /**
   * @deprecated Instead of `minDeltaX={N}` use `activeOffsetX={[-N, N]}`.
   *
   * Minimum distance along X (in points) axis the finger (or multiple finger)
   * need to travel (left or right) before the handler activates. Unlike
   * `minOffsetX` this parameter accepts only non-lower or equal to 0 numbers
   * that represents the distance in point units. If you want for the handler to
   * activate for the movement in one particular direction use `minOffsetX`
   * instead.
   */
  minDeltaX?: number;

  /**
   * @deprecated Instead of `minDeltaY={N}` use `activeOffsetY={[-N, N]}`.
   *
   * Minimum distance along Y (in points) axis the finger (or multiple finger)
   * need to travel (left or right) before the handler activates. Unlike
   * `minOffsetY` this parameter accepts only non-lower or equal to 0 numbers
   * that represents the distance in point units. If you want for the handler to
   * activate for the movement in one particular direction use `minOffsetY`
   * instead.
   */
  minDeltaY?: number;

  /**
   * @deprecated Instead of `maxDeltaX={N}` use `failOffsetX={[-N, N]}`.
   *
   * When the finger travels the given distance expressed in points along X axis
   * and handler hasn't yet activated it will fail
   * recognizing the gesture.
   */
  maxDeltaX?: number;

  /**
   * @deprecated Instead of `maxDeltaY={N}` use `failOffsetY={[-N, N]}`.
   *
   * When the finger travels the given distance expressed in points along Y axis
   * and handler hasn't yet activated it will fail
   * recognizing the gesture.
   */
  maxDeltaY?: number;

  /**
   * @deprecated Instead of `minOffsetX={N}` use `activeOffsetX={N}`.
   *
   * Minimum distance along X (in points) axis the finger (or multiple finger)
   * need to travel before the handler activates. If set to a lower or equal to
   * 0 value we expect the finger to travel "left" by the given distance. When
   * set to a higher or equal to 0 number the handler will activate on a
   * movement to the "right". If you wish for the movement direction to be
   * ignored use `minDeltaX` instead.
   */
  minOffsetX?: number;

  /**
   * @deprecated Instead of `minOffsetY={N}` use `activeOffsetY={N}`.
   *
   * Minimum distance along Y (in points) axis the finger (or multiple finger)
   * need to travel before the handler activates. If set to a lower or equal to
   * 0 value we expect the finger to travel "up" by the given distance. When
   * set to a higher or equal to 0 number the handler will activate on a
   * movement to the "bottom". If you wish for the movement direction to be
   * ignored use `minDeltaY` instead.
   */
  minOffsetY?: number;

  /**
   * Range along X axis (in points) where fingers travels without activation of
   * handler. Moving outside of this range implies activation of handler. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  activeOffsetY?: number | number[];

  /**
   * Range along X axis (in points) where fingers travels without activation of
   * handler. Moving outside of this range implies activation of handler. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  activeOffsetX?: number | number[];

  /**
   * When the finger moves outside this range (in points) along Y axis and
   * handler hasn't yet activated it will fail recognizing the gesture. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  failOffsetY?: number | number[];

  /**
   * When the finger moves outside this range (in points) along X axis and
   * handler hasn't yet activated it will fail recognizing the gesture. Range
   * can be given as an array or a single number. If range is set as an array,
   * first value must be lower or equal to 0, a the second one higher or equal
   * to 0. If only one number `p` is given a range of `(-inf, p)` will be used
   * if `p` is higher or equal to 0 and `(-p, inf)` otherwise.
   */
  failOffsetX?: number | number[];

  /**
   * Minimum distance the finger (or multiple finger) need to travel before the
   * handler activates. Expressed in points.
   */
  minDist?: number;

  minVelocity?: number;
  minVelocityX?: number;
  minVelocityY?: number;

  /**
   * A number of fingers that is required to be placed before handler can
   * activate. Should be a higher or equal to 0 integer.
   */
  minPointers?: number;

  /**
   * When the given number of fingers is placed on the screen and handler hasn't
   * yet activated it will fail recognizing the gesture. Should be a higher or
   * equal to 0 integer.
   */
  maxPointers?: number;

  /**
   * Android only.
   */
  avgTouches?: boolean;

  /**
   * Enables two-finger gestures on supported devices, for example iPads with
   * trackpads. If not enabled the gesture will require click + drag, with
   * enableTrackpadTwoFingerGesture swiping with two fingers will also trigger
   * the gesture.
   */
  enableTrackpadTwoFingerGesture?: boolean;
}

export type PanGestureHandler = typeof PanGestureHandler;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const PanGestureHandler = createHandler<
  PanGestureHandlerProps,
  PanGestureHandlerEventPayload
>({
  name: 'PanGestureHandler',
  allowedProps: [
    ...baseGestureHandlerProps,
    ...panGestureHandlerProps,
  ] as const,
  config: {},
  transformProps: managePanProps,
  customNativeProps: panGestureHandlerCustomNativeProps,
});

function validatePanGestureHandlerProps(props: PanGestureHandlerProps) {
  if (props.minDeltaX && props.activeOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.maxDeltaX && props.failOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.minDeltaY && props.activeOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (props.maxDeltaY && props.failOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (
    Array.isArray(props.activeOffsetX) &&
    (props.activeOffsetX[0] > 0 || props.activeOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.activeOffsetY) &&
    (props.activeOffsetY[0] > 0 || props.activeOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetY should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetX) &&
    (props.failOffsetX[0] > 0 || props.failOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetY) &&
    (props.failOffsetY[0] > 0 || props.failOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetY should be negative, a the second one should be positive`
    );
  }
}

function transformPanGestureHandlerProps(props: PanGestureHandlerProps) {
  type InternalPanGHKeys =
    | 'activeOffsetXStart'
    | 'activeOffsetXEnd'
    | 'failOffsetXStart'
    | 'failOffsetXEnd'
    | 'activeOffsetYStart'
    | 'activeOffsetYEnd'
    | 'failOffsetYStart'
    | 'failOffsetYEnd';
  type PanGestureHandlerInternalProps = PanGestureHandlerProps &
    Partial<Record<InternalPanGHKeys, number>>;

  const res: PanGestureHandlerInternalProps = { ...props };
  if (props.minDeltaX !== undefined) {
    delete res.minDeltaX;
    res.activeOffsetXStart = -props.minDeltaX;
    res.activeOffsetXEnd = props.minDeltaX;
  }
  if (props.maxDeltaX !== undefined) {
    delete res.maxDeltaX;
    res.failOffsetXStart = -props.maxDeltaX;
    res.failOffsetXEnd = props.maxDeltaX;
  }
  if (props.minOffsetX !== undefined) {
    delete res.minOffsetX;
    if (props.minOffsetX < 0) {
      res.activeOffsetXStart = props.minOffsetX;
    } else {
      res.activeOffsetXEnd = props.minOffsetX;
    }
  }

  if (props.minDeltaY !== undefined) {
    delete res.minDeltaY;
    res.activeOffsetYStart = -props.minDeltaY;
    res.activeOffsetYEnd = props.minDeltaY;
  }
  if (props.maxDeltaY !== undefined) {
    delete res.maxDeltaY;
    res.failOffsetYStart = -props.maxDeltaY;
    res.failOffsetYEnd = props.maxDeltaY;
  }

  if (props.minOffsetY !== undefined) {
    delete res.minOffsetY;
    if (props.minOffsetY < 0) {
      res.activeOffsetYStart = props.minOffsetY;
    } else {
      res.activeOffsetYEnd = props.minOffsetY;
    }
  }

  if (props.activeOffsetX !== undefined) {
    delete res.activeOffsetX;
    if (Array.isArray(props.activeOffsetX)) {
      res.activeOffsetXStart = props.activeOffsetX[0];
      res.activeOffsetXEnd = props.activeOffsetX[1];
    } else if (props.activeOffsetX < 0) {
      res.activeOffsetXStart = props.activeOffsetX;
    } else {
      res.activeOffsetXEnd = props.activeOffsetX;
    }
  }

  if (props.activeOffsetY !== undefined) {
    delete res.activeOffsetY;
    if (Array.isArray(props.activeOffsetY)) {
      res.activeOffsetYStart = props.activeOffsetY[0];
      res.activeOffsetYEnd = props.activeOffsetY[1];
    } else if (props.activeOffsetY < 0) {
      res.activeOffsetYStart = props.activeOffsetY;
    } else {
      res.activeOffsetYEnd = props.activeOffsetY;
    }
  }

  if (props.failOffsetX !== undefined) {
    delete res.failOffsetX;
    if (Array.isArray(props.failOffsetX)) {
      res.failOffsetXStart = props.failOffsetX[0];
      res.failOffsetXEnd = props.failOffsetX[1];
    } else if (props.failOffsetX < 0) {
      res.failOffsetXStart = props.failOffsetX;
    } else {
      res.failOffsetXEnd = props.failOffsetX;
    }
  }

  if (props.failOffsetY !== undefined) {
    delete res.failOffsetY;
    if (Array.isArray(props.failOffsetY)) {
      res.failOffsetYStart = props.failOffsetY[0];
      res.failOffsetYEnd = props.failOffsetY[1];
    } else if (props.failOffsetY < 0) {
      res.failOffsetYStart = props.failOffsetY;
    } else {
      res.failOffsetYEnd = props.failOffsetY;
    }
  }

  return res;
}

export function managePanProps(props: PanGestureHandlerProps) {
  if (__DEV__) {
    validatePanGestureHandlerProps(props);
  }
  return transformPanGestureHandlerProps(props);
}
