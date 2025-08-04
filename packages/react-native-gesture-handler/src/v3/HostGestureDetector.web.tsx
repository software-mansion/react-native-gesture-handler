import { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';
import { Wrap } from '../handlers/gestures/GestureDetector/Wrap';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, dispatchesAnimatedEvents, children } = props;

  const viewRef = useRef(null);
  const childRef = useRef(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlerTags = useRef<Set<number>>(new Set<number>());

  const shouldAttachGestureToChildView = useCallback(
    (handlerTag: number): boolean => {
      return RNGestureHandlerModule.getGestureHandlerNode(
        handlerTag
      ).shouldAttachGestureToChildView();
    },
    []
  );

  const detachHandlers = useCallback((oldHandlerTags: Set<number>) => {
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
    });
  }, []);

  const attachHandlers = useCallback(
    (currentHandlerTags: Set<number>) => {
      const oldHandlerTags =
        attachedHandlerTags.current.difference(currentHandlerTags);
      const newHandlerTags = currentHandlerTags.difference(
        attachedHandlerTags.current
      );

      detachHandlers(oldHandlerTags);

      newHandlerTags.forEach((tag) => {
        const attachTarget = shouldAttachGestureToChildView(tag)
          ? childRef.current
          : viewRef.current;
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          attachTarget,
          ActionType.NATIVE_DETECTOR,
          propsRef,
          dispatchesAnimatedEvents
        );
      });
      attachedHandlerTags.current = currentHandlerTags;
    },
    [dispatchesAnimatedEvents]
  );

  useEffect(() => {
    attachHandlers(new Set(handlerTags));
  }, [attachHandlers]);

  useEffect(() => {
    return () => {
      detachHandlers(attachedHandlerTags.current);
    };
  }, []);

  return (
    <View style={{ display: 'contents' }} ref={viewRef}>
      <Wrap ref={childRef}>{children}</Wrap>
    </View>
  );
};

export default HostGestureDetector;
