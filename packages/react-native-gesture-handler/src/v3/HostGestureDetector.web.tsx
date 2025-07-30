import { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
export interface GestureHandlerDetectorProps {
  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, dispatchesAnimatedEvents, children } = props;

  const viewRef = useRef(null);
  const propsRef = useRef<GestureHandlerDetectorProps>(props);
  const oldHandlerTags = useRef<Set<number>>(new Set<number>());
  const oldDispatchesAnimatedEvents = useRef<boolean>(null);

  const detachHandlers = useCallback(() => {
    handlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
    });
  }, [handlerTags]);

  const attachHandlers = useCallback(() => {
    if (oldDispatchesAnimatedEvents.current !== dispatchesAnimatedEvents) {
      // We reattach handlers, if the action type changes
      oldHandlerTags.current = new Set<number>();
      detachHandlers();
    }
    const currentHandlerTags = new Set(handlerTags);
    const newHandlerTags = currentHandlerTags.difference(
      oldHandlerTags.current
    );
    newHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.attachGestureHandler(
        tag,
        viewRef.current,
        dispatchesAnimatedEvents
          ? ActionType.NATIVE_DETECTOR_ANIMATED_EVENT
          : ActionType.NATIVE_DETECTOR,
        propsRef
      );
    });
    oldHandlerTags.current = currentHandlerTags;
  }, [handlerTags, dispatchesAnimatedEvents, detachHandlers]);

  useEffect(() => {
    attachHandlers();
    return () => {
      detachHandlers();
    };
  }, [attachHandlers, detachHandlers]);

  return <View ref={viewRef}>{children}</View>;
};

export default HostGestureDetector;
