import { StylusData } from '../web/interfaces';

export type FlingGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type ForceTouchGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;

  /**
   * The pressure of a touch.
   */
  force: number;
};

export type LongPressGestureHandlerEventPayload = {
  /**
   * X coordinate, expressed in points, of the current position of the pointer
   * (finger or a leading pointer when there are multiple fingers placed)
   * relative to the view attached to the handler.
   */
  x: number;

  /**
   * Y coordinate, expressed in points, of the current position of the pointer
   * (finger or a leading pointer when there are multiple fingers placed)
   * relative to the view attached to the handler.
   */
  y: number;

  /**
   * X coordinate, expressed in points, of the current position of the pointer
   * (finger or a leading pointer when there are multiple fingers placed)
   * relative to the window. It is recommended to use `absoluteX` instead of
   * `x` in cases when the view attached to the handler can be transformed as an
   * effect of the gesture.
   */
  absoluteX: number;

  /**
   * Y coordinate, expressed in points, of the current position of the pointer
   * (finger or a leading pointer when there are multiple fingers placed)
   * relative to the window. It is recommended to use `absoluteY` instead of
   * `y` in cases when the view attached to the handler can be transformed as an
   * effect of the gesture.
   */
  absoluteY: number;

  /**
   * Duration of the long press (time since the start of the event), expressed
   * in milliseconds.
   */
  duration: number;
};

export type NativeViewGestureHandlerPayload = {
  /**
   * True if gesture was performed inside of containing view, false otherwise.
   */
  pointerInside: boolean;
};

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
   * pointer when there are multiple fingers placed) relative to the window.
   * The value is expressed in point units. It is recommended to use it instead
   * of `x` in cases when the original view can be transformed as an effect of
   * the gesture.
   */
  absoluteX: number;

  /**
   * Y coordinate of the current position of the pointer (finger or a leading
   * pointer when there are multiple fingers placed) relative to the window.
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

  /**
   * Object containing additional stylus data.
   */
  stylusData?: StylusData;
};

export type PinchGestureHandlerEventPayload = {
  /**
   * The scale factor relative to the points of the two touches in screen
   * coordinates.
   */
  scale: number;

  /**
   * Position expressed in points along X axis of center anchor point of
   * gesture.
   */
  focalX: number;

  /**
   * Position expressed in points along Y axis of center anchor point of
   * gesture.
   */
  focalY: number;

  /**
   *
   * Velocity of the pan gesture the current moment. The value is expressed in
   * point units per second.
   */
  velocity: number;
};

export type TapGestureHandlerEventPayload = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type RotationGestureHandlerEventPayload = {
  /**
   * Amount rotated, expressed in radians, from the gesture's focal point
   * (anchor).
   */
  rotation: number;

  /**
   * X coordinate, expressed in points, of the gesture's central focal point
   * (anchor).
   */
  anchorX: number;

  /**
   * Y coordinate, expressed in points, of the gesture's central focal point
   * (anchor).
   */
  anchorY: number;

  /**
   *
   * Instantaneous velocity, expressed in point units per second, of the
   * gesture.
   */
  velocity: number;
};

export type HoverGestureHandlerEventPayload = {
  /**
   * X coordinate of the current position of the pointer relative to the view
   * attached to the handler. Expressed in point units.
   */
  x: number;

  /**
   * Y coordinate of the current position of the pointer relative to the view
   * attached to the handler. Expressed in point units.
   */
  y: number;

  /**
   * X coordinate of the current position of the pointer relative to the window.
   * The value is expressed in point units. It is recommended to use it instead
   * of `x` in cases when the original view can be transformed as an
   * effect of the gesture.
   */
  absoluteX: number;

  /**
   * Y coordinate of the current position of the pointer relative to the window.
   * The value is expressed in point units. It is recommended to use it instead
   * of `y` in cases when the original view can be transformed as an
   * effect of the gesture.
   */
  absoluteY: number;

  /**
   * Object containing additional stylus data.
   */
  stylusData?: StylusData;
};
