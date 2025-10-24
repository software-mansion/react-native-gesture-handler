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

  const handleRef = useCallback(
    (node: any) => {
      viewRef.current = node;
      if (!node) {
        return;
      }
      let tag: number | null = null;
      if (Platform.OS === 'web') {
        tag = node;
      } else {
        tag = findNodeHandle(node);
      }

      if (tag != null) {
        console.log('register ', tag);
        setViewTag(tag);
      }

      return () => {
        if (tag != null) {
          console.log('unregister ', tag);
          unregister(viewTag);
        }
      };
    },
    [props.children]
  );

  useEffect(() => {
    logicMethods.current = props.gesture.detectorCallbacks;
  }, [props.gesture.detectorCallbacks]);

  useEffect(() => {
    if (viewTag === -1) {
      return;
    }

    const logicProps = {
      viewTag,
      handlerTags: isComposedGesture(props.gesture)
        ? props.gesture.tags
        : [props.gesture.tag],
    };

    if (Platform.OS === 'web') {
      Object.assign(logicProps, { viewRef });
    }

    register(logicProps, logicMethods as RefObject<DetectorCallbacks<unknown>>);

    return () => {
      unregister(viewTag);
    };
  }, [viewTag, props.gesture, register, unregister]);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
