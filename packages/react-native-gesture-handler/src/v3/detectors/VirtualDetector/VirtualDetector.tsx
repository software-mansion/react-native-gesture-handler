import { useCallback, useEffect, useRef, useState } from 'react';
import { Wrap } from '../../../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle, Platform } from 'react-native';
import { useDetectorContext } from './useDetectorContext';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import { NativeDetectorProps } from '../common';
import { configureRelations } from '../utils';
import { tagMessage } from '../../../utils';
import { DetectorCallbacks, VirtualChild } from '../../types';

function useRequiredDetectorContext() {
  const context = useDetectorContext();
  if (!context) {
    throw new Error(
      tagMessage(
        'Virtual detector must be a descendant of an InterceptingGestureDecector'
      )
    );
  }
  return context;
}

export function VirtualDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig>
) {
  // Don't memoize virtual detectors to be able to listen to changes in children
  // TODO: replace with MutationObserver when it rolls out in React Native
  'use no memo';

  const { register, unregister } = useRequiredDetectorContext();

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
      ? props.gesture.tags
      : [props.gesture.tag];

    const virtualChild: VirtualChild = {
      viewTag,
      handlerTags,
      methods: props.gesture.detectorCallbacks as DetectorCallbacks<unknown>,
      forReanimated: !!props.gesture.config.shouldUseReanimatedDetector,
      forAnimated: !!props.gesture.config.dispatchesAnimatedEvents,
      // used by HostGestureDetector on web
      viewRef: Platform.OS === 'web' ? viewRef : undefined,
    };

    register(virtualChild);

    return () => {
      unregister(viewTag);
    };
  }, [viewTag, props.gesture, register, unregister]);

  configureRelations(props.gesture);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
