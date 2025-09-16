import { useCallback, useEffect, useRef, useState } from 'react';
import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle, Platform } from 'react-native';
import { useDetectorContext } from './NativeDetector/useDetectorContext';
import { NativeDetectorProps } from './NativeDetector/NativeDetector';
import { isComposedGesture } from './hooks/utils/relationUtils';

export const LogicDetector = (props: NativeDetectorProps) => {
  const { register, unregister } = useDetectorContext();
  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);
  const logicMethods = useRef({
    onGestureHandlerStateChange:
      props.gesture.gestureEvents.onGestureHandlerStateChange,
    onGestureHandlerEvent: props.gesture.gestureEvents.onGestureHandlerEvent,
    onGestureHandlerAnimatedEvent:
      props.gesture.gestureEvents.onGestureHandlerAnimatedEvent,
    onGestureHandlerTouchEvent:
      props.gesture.gestureEvents.onGestureHandlerTouchEvent,
    onReanimatedStateChange:
      props.gesture.gestureEvents.onReanimatedStateChange,
    onReanimatedUpdateEvent:
      props.gesture.gestureEvents.onReanimatedUpdateEvent,
    onReanimatedTouchEvent: props.gesture.gestureEvents.onReanimatedTouchEvent,
  });

  const handleRef = useCallback((node: any) => {
    viewRef.current = node;
    if (node) {
      if (Platform.OS === 'web') {
        setViewTag(node);
      } else {
        const tag = findNodeHandle(node);
        if (tag != null) {
          setViewTag(tag);
        }
      }
    }
  }, []);

  useEffect(() => {
    logicMethods.current = {
      onGestureHandlerStateChange:
        props.gesture.gestureEvents.onGestureHandlerStateChange,
      onGestureHandlerEvent: props.gesture.gestureEvents.onGestureHandlerEvent,
      onGestureHandlerTouchEvent:
        props.gesture.gestureEvents.onGestureHandlerTouchEvent,
      onGestureHandlerAnimatedEvent:
        props.gesture.gestureEvents.onGestureHandlerAnimatedEvent,
      onReanimatedStateChange:
        props.gesture.gestureEvents.onReanimatedStateChange,
      onReanimatedUpdateEvent:
        props.gesture.gestureEvents.onReanimatedUpdateEvent,
      onReanimatedTouchEvent:
        props.gesture.gestureEvents.onReanimatedTouchEvent,
    };
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

    const logicProps =
      Platform.OS === 'web'
        ? {
            viewRef,
            viewTag,
            handlerTags: isComposedGesture(props.gesture)
              ? props.gesture.tags
              : [props.gesture.tag],
          }
        : {
            viewTag,
            handlerTags: isComposedGesture(props.gesture)
              ? props.gesture.tags
              : [props.gesture.tag],
          };

    register(logicProps, logicMethods);

    return () => {
      unregister(viewTag);
    };
  }, [viewTag, props.gesture, register, unregister]);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
};
