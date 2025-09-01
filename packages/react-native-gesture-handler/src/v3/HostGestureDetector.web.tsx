import { Ref, RefObject, useEffect, useRef } from 'react';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';
import { View } from 'react-native';
import { tagMessage } from '../utils';
import { LogicDetectorProps } from './LogicDetector.web';
export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
  logicChildren?: Set<LogicDetectorProps>;
}

interface LogicChild {
  attachedHandlerTags: Set<number>;
  attachedNativeHandlerTags: Set<number>;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef<Element>(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlerTags = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlerTags = useRef<Set<number>>(new Set<number>());

  const logicChildren = useRef<Map<LogicDetectorProps, LogicChild>>(new Map());

  const detachHandlers = (
    oldHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>,
    attachedNativeHandlerTags: Set<number>
  ) => {
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
      attachedNativeHandlerTags.delete(tag);
      attachedHandlerTags.delete(tag);
    });
  };

  const attachHandlers = (
    viewRef: RefObject<Element | null>,
    propsRef: RefObject<PropsRef>,
    currentHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>,
    attachedNativeHandlerTags: Set<number>,
    childTag?: number
  ) => {
    const oldHandlerTags = attachedHandlerTags.difference(currentHandlerTags);
    const newHandlerTags = currentHandlerTags.difference(attachedHandlerTags);
    detachHandlers(
      oldHandlerTags,
      attachedHandlerTags,
      attachedNativeHandlerTags
    );

    newHandlerTags.forEach((tag) => {
      if (
        RNGestureHandlerModule.getGestureHandlerNode(
          tag
        ).shouldAttachGestureToChildView()
      ) {
        if (!viewRef.current?.firstChild) {
          throw new Error(
            tagMessage('Detector expected to have a child element')
          );
        }
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current.firstChild,
          childTag ? ActionType.LogicDetector : ActionType.NATIVE_DETECTOR,
          propsRef,
          childTag
        );
        attachedNativeHandlerTags.add(tag);
      } else {
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current,
          childTag ? ActionType.LogicDetector : ActionType.NATIVE_DETECTOR,
          propsRef,
          childTag
        );
      }
      attachedHandlerTags.add(tag);
    });
  };

  useEffect(() => {
    detachHandlers(
      attachedNativeHandlerTags.current,
      attachedHandlerTags.current,
      attachedNativeHandlerTags.current
    );
  }, [children]);

  useEffect(() => {
    attachHandlers(
      viewRef,
      propsRef,
      new Set(handlerTags),
      attachedHandlerTags.current,
      attachedNativeHandlerTags.current
    );

    props.logicChildren?.forEach((child) => {
      if (!logicChildren.current.has(child)) {
        logicChildren.current.set(child, {
          attachedHandlerTags: new Set(),
          attachedNativeHandlerTags: new Set(),
        });
      }
      const attachedHandlerTags =
        logicChildren.current.get(child)?.attachedHandlerTags;
      const attachedNativeHandlerTags =
        logicChildren.current.get(child)?.attachedNativeHandlerTags;
      if (attachedHandlerTags && attachedNativeHandlerTags) {
        attachHandlers(
          child.viewRef,
          propsRef,
          new Set(child.handlerTags),
          attachedHandlerTags,
          attachedNativeHandlerTags,
          child.viewTag
        );
      }
    });
  }, [handlerTags, children]);

  useEffect(() => {
    return () => {
      detachHandlers(
        attachedHandlerTags.current,
        attachedHandlerTags.current,
        attachedNativeHandlerTags.current
      );
      props.logicChildren?.forEach((child) => {
        const attachedHandlerTags =
          logicChildren.current.get(child)?.attachedHandlerTags;
        const attachedNativeHandlerTags =
          logicChildren.current.get(child)?.attachedNativeHandlerTags;
        if (attachedHandlerTags && attachedNativeHandlerTags) {
          detachHandlers(
            attachedHandlerTags,
            attachedHandlerTags,
            attachedNativeHandlerTags
          );
        }
      });
    };
  }, []);

  return (
    <View style={{ display: 'contents' }} ref={viewRef as Ref<View>}>
      {children}
    </View>
  );
};

export default HostGestureDetector;
