import { useEffect, useRef, useState } from 'react';
import { useDetectorContext } from './NativeDetector';
import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';
import { NativeDetectorProps } from './types';

export const LogicDetector = (props: NativeDetectorProps) => {
  const { register, unregister } = useDetectorContext();
  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);
  const logicMethods = useRef({
    onGestureHandlerStateChange:
      props.gesture.gestureEvents.onGestureHandlerStateChange,
    onGestureHandlerEvent: props.gesture.gestureEvents.onGestureHandlerEvent,
    onGestureHandlerTouchEvent:
      props.gesture.gestureEvents.onGestureHandlerTouchEvent,
  });

  useEffect(() => {
    // TODO: set tags from parent
    setViewTag(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  }, []);

  useEffect(() => {
    logicMethods.current = {
      onGestureHandlerStateChange:
        props.gesture.gestureEvents.onGestureHandlerStateChange,
      onGestureHandlerEvent: props.gesture.gestureEvents.onGestureHandlerEvent,
      onGestureHandlerTouchEvent:
        props.gesture.gestureEvents.onGestureHandlerTouchEvent,
    };
  }, [props.gesture.gestureEvents]);

  useEffect(() => {
    const logicProps = {
      viewRef: viewRef,
      viewTag: viewTag,
      moduleId: globalThis._RNGH_MODULE_ID,
      handlerTags: [props.gesture.tag],
    };

    register(logicProps, logicMethods);

    return () => {
      unregister(viewTag);
    };
  }, [viewTag, props.gesture.tag, register, unregister]);

  return <Wrap ref={viewRef}>{props.children}</Wrap>;
};
