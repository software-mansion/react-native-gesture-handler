import { useEffect, useRef } from 'react';
import { NativeDetectorProps, useDetectorContext } from './NativeDetector';
import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';

export const LogicDetector = (props: NativeDetectorProps) => {
  const { register, unregister } = useDetectorContext();
  const viewRef = useRef(null);
  const attachedHandlerTags = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlerTags = useRef<Set<number>>(new Set<number>());

  const propsRef = useRef({
    onGestureHandlerStateChange:
      props.gesture.gestureEvents.onGestureHandlerStateChange,
    onGestureHandlerEvent: props.gesture.gestureEvents.onGestureHandlerEvent!,
    onGestureHandlerAnimatedEvent:
      props.gesture.gestureEvents.onGestureHandlerAnimatedEvent,
    onGestureHandlerTouchEvent:
      props.gesture.gestureEvents.onGestureHandlerTouchEvent,
    moduleId: globalThis._RNGH_MODULE_ID,
    handlerTags: [props.gesture.tag],
  });

  const logicChild = useRef({
    viewRef: viewRef,
    propsRef: propsRef,
    attachedHandlerTags: attachedHandlerTags,
    attachedNativeHandlerTags: attachedNativeHandlerTags,
  });

  useEffect(() => {
    register(logicChild.current);

    return () => {
      unregister(logicChild.current);
    };
  }, [register, unregister]);

  return <Wrap ref={viewRef}>{props.children}</Wrap>;
};
