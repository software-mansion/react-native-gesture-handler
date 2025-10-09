import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrap } from '../../../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle, Platform } from 'react-native';
import { useDetectorContext } from './useDetectorContext';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import { GestureEvents } from '../../types';
import { NativeDetectorProps } from '../common';

export function LogicDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig>
) {
  const { register, unregister } = useDetectorContext();
  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);
  const logicMethods = useRef(props.gesture.gestureEvents);

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
    logicMethods.current = props.gesture.gestureEvents;
  }, [props.gesture.gestureEvents]);

  useEffect(() => {
    if (viewTag === -1) {
      return;
    }

    // Native Detector differentiates Logic Children through a viewTag,
    // thus if viewTag changes we have to reregister
    unregister(viewTag);
  }, [viewTag]);

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

    register(logicProps, logicMethods as RefObject<GestureEvents<unknown>>);

    return () => {
      unregister(viewTag);
    };
  }, [viewTag, props.gesture, register, unregister]);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
