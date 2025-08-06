import { useEffect, useRef, useCallback } from 'react';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlerTags = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlerTags = useRef<Set<number>>(new Set<number>());

  const shouldAttachGestureToChildView = (handlerTag: number): boolean => {
    return RNGestureHandlerModule.getGestureHandlerNode(
      handlerTag
    ).shouldAttachGestureToChildView();
  };

  const detachHandlers = useCallback((oldHandlerTags: Set<number>) => {
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
      attachedNativeHandlerTags.current.delete(tag);
      attachedHandlerTags.current.delete(tag);
    });
  }, []);

  const attachHandlers = useCallback((currentHandlerTags: Set<number>) => {
    const oldHandlerTags =
      attachedHandlerTags.current.difference(currentHandlerTags);
    const newHandlerTags = currentHandlerTags.difference(
      attachedHandlerTags.current
    );

    detachHandlers(oldHandlerTags);

    newHandlerTags.forEach((tag) => {
      const shouldAttachToChild = shouldAttachGestureToChildView(tag);
      const attachTarget = shouldAttachToChild
        ? viewRef.current!.firstChild
        : viewRef.current;

      if (shouldAttachToChild) {
        attachedNativeHandlerTags.current.add(tag);
      }

      RNGestureHandlerModule.attachGestureHandler(
        tag,
        attachTarget,
        ActionType.NATIVE_DETECTOR,
        propsRef
      );
    });
    attachedHandlerTags.current = currentHandlerTags;
  }, []);

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
    <div style={{ display: 'contents' }} ref={viewRef}>
      {children}
    </div>
  );
};

export default HostGestureDetector;
