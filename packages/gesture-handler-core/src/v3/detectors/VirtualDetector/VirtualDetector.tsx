import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { tagMessage } from '../../../utils';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import type { CoreRuntime } from '../../platform/Port';
import type { DetectorCallbacks, VirtualChild } from '../../types';
import type { VirtualDetectorProps } from '../common';
import { useDetectorAttachmentGuard } from '../useDetectorAttachmentGuard';
import { useGestureRelationsUpdater } from '../useGestureRelationsUpdater';
import {
  InterceptingDetectorMode,
  useInterceptingDetectorContext,
} from './useInterceptingDetectorContext';

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
>(
  runtime: CoreRuntime,
  props: VirtualDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
) {
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
        const tag = runtime.port.detector.getViewTag(node) as number;
        setViewTag(tag ?? -1);
      } else {
        setViewTag(-1);
      }
    },
    // Invalid dependency array to change the function when children change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.children]
  );

  const useNativeGestureRole = runtime.port.detector.useNativeGestureRole;
  useNativeGestureRole(viewRef, props.children);

  const handlerTags = useMemo(
    () =>
      isComposedGesture(props.gesture)
        ? props.gesture.handlerTags
        : [props.gesture.handlerTag],
    [props.gesture]
  );

  useDetectorAttachmentGuard(handlerTags);

  useEffect(() => {
    if (viewTag === -1) {
      return;
    }

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
      viewRef: runtime.port.capabilities.virtualChildrenCarryViewRefs
        ? viewRef
        : undefined,
      userSelect: props.userSelect,
      touchAction: props.touchAction,
      enableContextMenu: props.enableContextMenu,
    };
    register(virtualChild);
    return () => {
      unregister(virtualChild);
    };
  }, [
    viewTag,
    props.gesture,
    handlerTags,
    props.userSelect,
    props.touchAction,
    props.enableContextMenu,
    register,
    unregister,
    setMode,
  ]);

  useGestureRelationsUpdater(runtime, props.gesture);

  const Wrap = runtime.port.detector.Wrap;

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
