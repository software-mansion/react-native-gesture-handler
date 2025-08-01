import { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';
export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
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
        ActionType.NATIVE_DETECTOR,
        propsRef,
        dispatchesAnimatedEvents
      );
    });
  }, [handlerTags, dispatchesAnimatedEvents]);

  useEffect(() => {
    attachHandlers();
    return () => {
      detachHandlers();
    };
  }, [attachHandlers, detachHandlers]);

  return (
    <View style={{ display: 'contents' }} ref={viewRef}>
      {children}
    </View>
  );
};

export default HostGestureDetector;
