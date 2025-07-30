import { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';
export interface GestureHandlerDetectorProps {
  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
  onGestureHandlerEvent: () => void;
  onGestureHandlerAnimatedEvent?: () => void;
  onGestureHandlerStateChange: () => void;
  onGestureHandlerTouchEvent?: () => void;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, dispatchesAnimatedEvents, children } = props;

  const viewRef = useRef(null);
  const propsRef = useRef<PropsRef>(props);

  const detachHandlers = useCallback(() => {
    handlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
    });
  }, [handlerTags]);

  const attachHandlers = useCallback(() => {
    // TODO: add memoisation

    handlerTags.forEach((tag) => {
      RNGestureHandlerModule.attachGestureHandler(
        tag,
        viewRef.current,
        dispatchesAnimatedEvents
          ? ActionType.NATIVE_DETECTOR_ANIMATED_EVENT
          : ActionType.NATIVE_DETECTOR,
        propsRef
      );
    });
  }, [handlerTags, dispatchesAnimatedEvents]);

  useEffect(() => {
    attachHandlers();
    return () => {
      detachHandlers();
    };
  }, [attachHandlers, detachHandlers]);

  return <View ref={viewRef}>{children}</View>;
};

export default HostGestureDetector;
