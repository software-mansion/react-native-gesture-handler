/* eslint-disable react/no-unused-prop-types */
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import findNodeHandle from '../../../findNodeHandle';
import { GestureType } from '../gesture';
import { UserSelect, TouchAction } from '../../gestureHandlerCommon';
import { ComposedGesture } from '../gestureComposition';

import { AttachedGestureState, GestureDetectorState } from './types';
import { attachHandlers } from './attachHandlers';
import { dropHandlers } from './dropHandlers';
import { useWebEventHandlers } from './utils';
import { Wrap } from './Wrap';
import { useDetectorUpdater } from './useDetectorUpdater';
import { useViewRefHandler } from './useViewRefHandler';
import { useMountReactions } from './useMountReactions';

function propagateDetectorConfig(
  props: GestureDetectorProps,
  gesture: ComposedGesture | GestureType
) {
  const keysToPropagate: (keyof GestureDetectorProps)[] = [
    'userSelect',
    'enableContextMenu',
    'touchAction',
  ];

  for (const key of keysToPropagate) {
    const value = props[key];
    if (value === undefined) {
      continue;
    }

    for (const g of gesture.toGestureArray()) {
      const config = g.config as { [key: string]: unknown };
      config[key] = value;
    }
  }
}

interface GestureDetectorProps {
  children?: React.ReactNode;
  /**
   * A gesture object containing the configuration and callbacks.
   * Can be any of:
   * - base gestures (`Tap`, `Pan`, ...)
   * - `ComposedGesture` (`Race`, `Simultaneous`, `Exclusive`)
   */
  gesture: ComposedGesture | GestureType;
  /**
   * #### Web only
   * This parameter allows to specify which `userSelect` property should be applied to underlying view.
   * Possible values are `"none" | "auto" | "text"`. Default value is set to `"none"`.
   */
  userSelect?: UserSelect;
  /**
   * #### Web only
   * Specifies whether context menu should be enabled after clicking on underlying view with right mouse button.
   * Default value is set to `false`.
   */
  enableContextMenu?: boolean;
  /**
   * #### Web only
   * This parameter allows to specify which `touchAction` property should be applied to underlying view.
   * Supports all CSS touch-action values (e.g. `"none"`, `"pan-y"`). Default value is set to `"none"`.
   */
  touchAction?: TouchAction;
}

/**
 * `GestureDetector` is responsible for creating and updating native gesture handlers based on the config of provided gesture.
 *
 * ### Props
 * - `gesture`
 * - `userSelect` (**Web only**)
 * - `enableContextMenu` (**Web only**)
 * - `touchAction` (**Web only**)
 *
 * ### Remarks
 * - Gesture Detector will use first native view in its subtree to recognize gestures, however if this view is used only to group its children it may get automatically collapsed.
 * - Using the same instance of a gesture across multiple Gesture Detectors is not possible.
 *
 * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture-detector
 */
export const GestureDetector = (props: GestureDetectorProps) => {
  // Gesture config should be wrapped with useMemo to prevent unnecessary re-renders
  const gestureConfig = props.gesture;
  propagateDetectorConfig(props, gestureConfig);

  const gesturesToAttach = useMemo(
    () => gestureConfig.toGestureArray(),
    [gestureConfig]
  );

  const webEventHandlersRef = useWebEventHandlers();
  // Store state in ref to prevent unnecessary renders
  const state = useRef<GestureDetectorState>({
    firstRender: true,
    viewRef: null,
    previousViewTag: null,
  }).current;

  const preparedGesture = React.useRef<AttachedGestureState>({
    attachedGestures: [],
    isMounted: false,
  }).current;

  const updateAttachedGestures = useDetectorUpdater(
    state,
    preparedGesture,
    gesturesToAttach,
    gestureConfig,
    webEventHandlersRef
  );

  const refHandler = useViewRefHandler(state, updateAttachedGestures);

  useLayoutEffect(() => {
    const viewTag = findNodeHandle(state.viewRef!);
    preparedGesture.isMounted = true;

    attachHandlers({
      preparedGesture,
      gestureConfig,
      gesturesToAttach,
      webEventHandlersRef,
      viewTag,
    });

    return () => {
      preparedGesture.isMounted = false;
      dropHandlers(preparedGesture);
    };
  }, []);

  useEffect(() => {
    if (state.firstRender) {
      state.firstRender = false;
    } else {
      updateAttachedGestures();
    }
  }, [props]);

  useMountReactions(updateAttachedGestures, preparedGesture);

  return <Wrap ref={refHandler}>{props.children}</Wrap>;
};
