import { useEffect, useRef, useState } from 'react';
import { NativeDetectorProps, useDetectorContext } from './NativeDetector';
import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle } from 'react-native';

export interface LogicDetectorProps {
  viewTag: number;
  moduleId: number;
  handlerTags: number[];
}

export const LogicDetector = (props: NativeDetectorProps) => {
  const { register, unregister } = useDetectorContext();
  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);
  const logicMethods = {
    onGestureHandlerStateChange:
      props.gesture.gestureEvents.onGestureHandlerStateChange,
    onGestureHandlerEvent: props.gesture.gestureEvents.onGestureHandlerEvent!,
    onGestureHandlerAnimatedEvent:
      props.gesture.gestureEvents.onGestureHandlerAnimatedEvent,
    onGestureHandlerTouchEvent:
      props.gesture.gestureEvents.onGestureHandlerTouchEvent,
  };
  useEffect(() => {
    setViewTag(findNodeHandle(viewRef.current)!);
  }, []);

  useEffect(() => {
    const logicProps = {
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
