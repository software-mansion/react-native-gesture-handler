import { useCallback, useEffect, useRef, useState } from 'react';
import { Wrap } from '../../../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle, Platform } from 'react-native';
import {
  InterceptingDetectorMode,
  useInterceptingDetectorContext,
} from './useInterceptingDetectorContext';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import { VirtualDetectorProps } from '../common';
import { configureRelations } from '../utils';
import { tagMessage } from '../../../utils';
import { DetectorCallbacks, VirtualChild } from '../../types';

function useRequiredInterceptingDetectorContext() {
  const context = useInterceptingDetectorContext();
  if (!context) {
    throw new Error(
      tagMessage(
        'VirtualGestureDetector must be a descendant of an InterceptingGestureDetector'
      )
    );
  }
  return context;
}

export function VirtualDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(props: VirtualDetectorProps<TConfig, THandlerData, TExtendedHandlerData>) {
  // Don't memoize virtual detectors to be able to listen to changes in children
  // TODO: replace with MutationObserver when it rolls out in React Native
  'use no memo';

  const { register, unregister, setMode } =
    useRequiredInterceptingDetectorContext();

  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);

  const handleRef = useCallback(
    (node: any) => {
      viewRef.current = node;
      if (node) {
        const tag: number = Platform.OS === 'web' ? node : findNodeHandle(node);
        setViewTag(tag ?? -1);
      } else {
        setViewTag(-1);
      }
    },
    // Invalid dependency array to change the function when children change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.children]
  );

  useEffect(() => {
    if (viewTag === -1) {
      return;
    }

    const handlerTags = isComposedGesture(props.gesture)
      ? props.gesture.handlerTags
      : [props.gesture.handlerTag];

    if (props.gesture.config.dispatchesAnimatedEvents) {
      throw new Error(
        tagMessage(
          'VirtualGestureDetector cannot handle Animated events with native driver when used inside InterceptingGestureDetector. Use Reanimated or Animated events without native driver instead.'
        )
      );
    } else if (props.gesture.config.shouldUseReanimatedDetector) {
      setMode(InterceptingDetectorMode.REANIMATED);
    }

    const virtualChild: VirtualChild = {
      viewTag,
      handlerTags,
      methods: props.gesture.detectorCallbacks as DetectorCallbacks<
        unknown,
        unknown
      >,
      // used by HostGestureDetector on web
      viewRef: Platform.OS === 'web' ? viewRef : undefined,
    };

    register(virtualChild);

    return () => {
      unregister(virtualChild);
    };
  }, [viewTag, props.gesture, register, unregister, setMode]);

  configureRelations(props.gesture);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
