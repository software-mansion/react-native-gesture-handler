import { Ref, useEffect, useRef } from 'react';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';
import { View } from 'react-native';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef<Element>(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlerTags = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlerTags = useRef<Set<number>>(new Set<number>());

  const shouldAttachGestureToChildView = (handlerTag: number): boolean => {
    return (
      RNGestureHandlerModule.getGestureHandlerNode(
        handlerTag
      ).shouldAttachGestureToChildView() && !!viewRef.current?.firstChild
    );
  };

  const detachHandlers = (oldHandlerTags: Set<number>) => {
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
      attachedNativeHandlerTags.current.delete(tag);
      attachedHandlerTags.current.delete(tag);
    });
  };

  const attachHandlers = (currentHandlerTags: Set<number>) => {
    const oldHandlerTags =
      attachedHandlerTags.current.difference(currentHandlerTags);
    const newHandlerTags = currentHandlerTags.difference(
      attachedHandlerTags.current
    );

    detachHandlers(oldHandlerTags);

    newHandlerTags.forEach((tag) => {
      if (shouldAttachGestureToChildView(tag)) {
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current!.firstChild,
          ActionType.NATIVE_DETECTOR,
          propsRef
        );
        attachedNativeHandlerTags.current.add(tag);
      } else {
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current,
          ActionType.NATIVE_DETECTOR,
          propsRef
        );
      }
    });
    attachedHandlerTags.current = currentHandlerTags;
  };

  useEffect(() => {
    detachHandlers(attachedNativeHandlerTags.current);
  }, [children]);

  useEffect(() => {
    attachHandlers(new Set(handlerTags));
  }, [handlerTags, children]);

  useEffect(() => {
    return () => {
      detachHandlers(attachedHandlerTags.current);
    };
  }, []);

  return (
    <View style={{ display: 'contents' }} ref={viewRef as Ref<View>}>
      {children}
    </View>
  );
};

export default HostGestureDetector;
