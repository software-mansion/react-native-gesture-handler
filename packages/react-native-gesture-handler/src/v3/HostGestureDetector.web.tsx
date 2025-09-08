import React, { Ref, RefObject, useEffect, useRef } from 'react';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
import { PropsRef } from '../web/interfaces';
import { View } from 'react-native';
import { tagMessage } from '../utils';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
  logicChildren?: Set<LogicDetectorProps>;
}

export interface LogicDetectorProps {
  viewTag: number;
  moduleId: number;
  handlerTags: number[];
  viewRef: RefObject<Element | null>;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef<Element>(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlerTags = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlerTags = useRef<Set<number>>(new Set<number>());

  const logicChildren = useRef<Map<number, Set<number>>>(new Map());

  const detachHandlers = (
    oldHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>
  ) => {
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
      attachedNativeHandlerTags.current.delete(tag);
      attachedHandlerTags.delete(tag);
    });
  };

  const attachHandlers = (
    viewRef: RefObject<Element | null>,
    propsRef: RefObject<PropsRef>,
    currentHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>,
    isLogic: boolean
  ) => {
    const oldHandlerTags = attachedHandlerTags.difference(currentHandlerTags);
    const newHandlerTags = currentHandlerTags.difference(attachedHandlerTags);
    detachHandlers(oldHandlerTags, attachedHandlerTags);

    newHandlerTags.forEach((tag) => {
      if (
        RNGestureHandlerModule.getGestureHandlerNode(
          tag
        ).shouldAttachGestureToChildView()
      ) {
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
          isLogic ? ActionType.LOGIC_DETECTOR : ActionType.NATIVE_DETECTOR,
          propsRef
        );
      }
      attachedHandlerTags.add(tag);
    });
  };

  useEffect(() => {
    detachHandlers(
      attachedNativeHandlerTags.current,
      attachedHandlerTags.current
    );
  }, [children]);

  useEffect(() => {
    if (React.Children.count(children) !== 1) {
      throw new Error(
        tagMessage('Detector expected to have exactly one child element')
      );
    }

    attachHandlers(
      viewRef,
      propsRef,
      new Set(handlerTags),
      attachedHandlerTags.current,
      false
    );
  }, [handlerTags, children]);

  useEffect(() => {
    const logicChildrenToDelete: Set<number> = new Set();

    for (const key of logicChildren.current.keys()) {
      logicChildrenToDelete.add(key);
    }

    props.logicChildren?.forEach((child) => {
      if (!logicChildren.current.has(child.viewTag)) {
        logicChildren.current.set(child.viewTag, new Set());
      }
      logicChildrenToDelete.delete(child.viewTag);
      attachHandlers(
        child.viewRef,
        propsRef,
        new Set(child.handlerTags),
        logicChildren.current.get(child.viewTag)!,
        true
      );
    });

    logicChildrenToDelete.forEach((childTag) => {
      if (attachedHandlerTags && attachedNativeHandlerTags) {
        detachHandlers(
          logicChildren.current.get(childTag)!,
          logicChildren.current.get(childTag)!
        );
      }
      logicChildren.current.delete(childTag);
    });
  }, [props.logicChildren]);

  useEffect(() => {
    return () => {
      detachHandlers(attachedHandlerTags.current, attachedHandlerTags.current);
      logicChildren?.current.forEach((child) => {
        detachHandlers(child, child);
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
