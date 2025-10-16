/* eslint-disable react/no-unused-prop-types */
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import findNodeHandle from '../../../findNodeHandle';
import { GestureType } from '../gesture';
import { UserSelect, TouchAction } from '../../gestureHandlerCommon';
import { ComposedGesture } from '../gestureComposition';
import { isTestEnv } from '../../../utils';

import GestureHandlerRootViewContext from '../../../GestureHandlerRootViewContext';
import { AttachedGestureState, GestureDetectorState } from './types';
import { useAnimatedGesture } from './useAnimatedGesture';
import { attachHandlers } from './attachHandlers';
import { needsToReattach } from './needsToReattach';
import { dropHandlers } from './dropHandlers';
import { useWebEventHandlers } from './utils';
import { Wrap, AnimatedWrap } from './Wrap';
import { useDetectorUpdater } from './useDetectorUpdater';
import { useViewRefHandler } from './useViewRefHandler';
import { useMountReactions } from './useMountReactions';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

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
  const rootViewContext = useContext(GestureHandlerRootViewContext);
  if (__DEV__ && !rootViewContext && !isTestEnv() && Platform.OS !== 'web') {
    throw new Error(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  }

  // Gesture config should be wrapped with useMemo to prevent unnecessary re-renders
  const gestureConfig = props.gesture;
  propagateDetectorConfig(props, gestureConfig);

  const gesturesToAttach = useMemo(
    () => gestureConfig.toGestureArray(),
    [gestureConfig]
  );
  const shouldUseReanimated = gesturesToAttach.some(
    (g) => g.shouldUseReanimated
  );

  const webEventHandlersRef = useWebEventHandlers();
  // Store state in ref to prevent unnecessary renders
  const state = useRef<GestureDetectorState>({
    firstRender: true,
    viewRef: null,
    previousViewTag: -1,
    forceRebuildReanimatedEvent: false,
  }).current;

  const preparedGesture = React.useRef<AttachedGestureState>({
    attachedGestures: [],
    animatedEventHandler: null,
    animatedHandlers: null,
    shouldUseReanimated: shouldUseReanimated,
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

  // Reanimated event should be rebuilt only when gestures are reattached, otherwise
  // config update will be enough as all necessary items are stored in shared values anyway
  const needsToRebuildReanimatedEvent =
    state.firstRender ||
    state.forceRebuildReanimatedEvent ||
    needsToReattach(preparedGesture, gesturesToAttach);
  state.forceRebuildReanimatedEvent = false;

  useAnimatedGesture(preparedGesture, needsToRebuildReanimatedEvent);

  useIsomorphicLayoutEffect(() => {
    const viewTag = findNodeHandle(state.viewRef) as number;
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

  if (shouldUseReanimated) {
    return (
      <AnimatedWrap
        ref={refHandler}
        onGestureHandlerEvent={preparedGesture.animatedEventHandler}>
        {props.children}
      </AnimatedWrap>
    );
  } else {
    return <Wrap ref={refHandler}>{props.children}</Wrap>;
  }
};
