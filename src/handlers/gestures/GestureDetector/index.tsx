/* eslint-disable react/no-unused-prop-types */
import React, { useContext, useEffect, useRef } from 'react';
import { GestureType } from '../gesture';
import {
  findNodeHandle,
  UserSelect,
  TouchAction,
} from '../../gestureHandlerCommon';
import { ComposedGesture } from '../gestureComposition';
import { isFabric, isJestEnv, tagMessage } from '../../../utils';
import { getShadowNodeFromRef } from '../../../getShadowNodeFromRef';
import { Platform } from 'react-native';

import GestureHandlerRootViewContext from '../../../GestureHandlerRootViewContext';
import { AttachedGestureState } from './types';
import { useAnimatedGesture } from './useAnimatedGesture';
import { attachHandlers } from './attachHandlers';
import { updateHandlers } from './updateHandlers';
import { needsToReattach } from './needsToReattach';
import { dropHandlers } from './dropHandlers';
import {
  useForceRender,
  useWebEventHandlers,
  validateDetectorChildren,
} from './utils';
import { Wrap, AnimatedWrap } from './Wrap';

declare const global: {
  isFormsStackingContext: (node: unknown) => boolean | null; // JSI function
};

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

interface GestureDetectorState {
  firstRender: boolean;
  viewRef: React.Component | null;
  previousViewTag: number;
  forceRebuildReanimatedEvent: boolean;
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
  if (__DEV__ && !rootViewContext && !isJestEnv() && Platform.OS !== 'web') {
    throw new Error(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/installation for more details.'
    );
  }
  const forceRender = useForceRender();
  const webEventHandlersRef = useWebEventHandlers();

  const gestureConfig = props.gesture;
  propagateDetectorConfig(props, gestureConfig);

  const gesturesToAttach = gestureConfig.toGestureArray();
  const shouldUseReanimated = gesturesToAttach.some(
    (g) => g.shouldUseReanimated
  );

  // store state in ref to prevent unnecessary renders
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

  // Reanimated event should be rebuilt only when gestures are reattached, otherwise
  // config update will be enough as all necessary items are stored in shared values anyway
  const needsToRebuildReanimatedEvent =
    state.firstRender ||
    needsToReattach(preparedGesture, gesturesToAttach) ||
    state.forceRebuildReanimatedEvent;
  state.forceRebuildReanimatedEvent = false;

  useAnimatedGesture(preparedGesture, needsToRebuildReanimatedEvent);

  function onHandlersUpdate(skipConfigUpdate?: boolean) {
    // if the underlying view has changed we need to reattach handlers to the new view
    const viewTag = findNodeHandle(state.viewRef) as number;
    const didUnderlyingViewChange = viewTag !== state.previousViewTag;

    if (
      didUnderlyingViewChange ||
      needsToReattach(preparedGesture, gesturesToAttach)
    ) {
      validateDetectorChildren(state.viewRef);
      dropHandlers(preparedGesture);
      attachHandlers({
        preparedGesture,
        gestureConfig,
        gesturesToAttach,
        webEventHandlersRef,
        viewTag,
      });

      if (didUnderlyingViewChange) {
        state.previousViewTag = viewTag;
        state.forceRebuildReanimatedEvent = true;
        forceRender();
      }
    } else if (!skipConfigUpdate) {
      updateHandlers(preparedGesture, gestureConfig, gesturesToAttach);
    }
  }

  useEffect(() => {
    const viewTag = findNodeHandle(state.viewRef) as number;
    preparedGesture.isMounted = true;

    validateDetectorChildren(state.viewRef);

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
    if (!state.firstRender) {
      onHandlersUpdate();
    } else {
      state.firstRender = false;
    }
  }, [props]);

  const refFunction = (ref: unknown) => {
    if (ref === null) {
      return;
    }

    // @ts-ignore Just setting the view ref
    state.viewRef = ref;

    // if it's the first render, also set the previousViewTag to prevent reattaching gestures when not needed
    if (state.previousViewTag === -1) {
      state.previousViewTag = findNodeHandle(state.viewRef) as number;
    }

    // pass true as `skipConfigUpdate`, here we only want to trigger the eventual reattaching of handlers
    // in case the view has changed, while config update would be handled be the `useEffect` above
    onHandlersUpdate(true);

    if (__DEV__ && isFabric() && global.isFormsStackingContext) {
      const node = getShadowNodeFromRef(ref);
      if (global.isFormsStackingContext(node) === false) {
        console.error(
          tagMessage(
            'GestureDetector has received a child that may get view-flattened. ' +
              '\nTo prevent it from misbehaving you need to wrap the child with a `<View collapsable={false}>`.'
          )
        );
      }
    }
  };

  if (shouldUseReanimated) {
    return (
      <AnimatedWrap
        ref={refFunction}
        onGestureHandlerEvent={preparedGesture.animatedEventHandler}>
        {props.children}
      </AnimatedWrap>
    );
  } else {
    return <Wrap ref={refFunction}>{props.children}</Wrap>;
  }
};
