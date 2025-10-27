import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle, Platform } from 'react-native';
import { useDetectorContext } from './NativeDetector/useDetectorContext';
import { NativeDetectorProps } from './NativeDetector/NativeDetector';
import { isComposedGesture } from './hooks/utils/relationUtils';
import { DetectorCallbacks } from './types';

export function LogicDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig>
) {
  const { register, unregister } = useDetectorContext();
  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);
  const logicMethods = useRef(props.gesture.detectorCallbacks);

  const handleRef = useCallback((node: any) => {
    viewRef.current = node;
    if (!node) {
      return;
    }

    if (Platform.OS === 'web') {
      setViewTag(node);
    } else {
      const tag = findNodeHandle(node);
      if (tag != null) {
        setViewTag(tag);
      }
    }
  }, []);

  useEffect(() => {
    logicMethods.current = props.gesture.detectorCallbacks;
  }, [props.gesture.detectorCallbacks]);

  useEffect(() => {
    if (viewTag === -1) {
      return;
    }

    const handlerTags = isComposedGesture(props.gesture)
      ? props.gesture.tags
      : [props.gesture.tag];

    const logicProps = {
      viewTag,
      handlerTags,
    };

    if (Platform.OS === 'web') {
      Object.assign(logicProps, { viewRef });
    }

    register(logicProps, logicMethods as RefObject<DetectorCallbacks<unknown>>);

    return () => {
      unregister(viewTag, handlerTags);
    };
  }, [viewTag, props.gesture, register, unregister]);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
