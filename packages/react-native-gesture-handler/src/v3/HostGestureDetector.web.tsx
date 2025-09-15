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
  logicChildren?: Set<LogicChildrenProps>;
}

export interface LogicChildrenProps {
  viewTag: number;
  handlerTags: number[];
  viewRef: RefObject<Element | null>;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef<Element>(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlers = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlers = useRef<Set<number>>(new Set<number>());
  const attachedLogicHandlers = useRef<Map<number, Set<number>>>(new Map());

  const detachAllHandlers = (attachedHandlerTags: Set<number>) => {
    // Separate function to reduce the number of conditions
    attachedHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
      attachedNativeHandlers.current.delete(tag);
    });
    attachedHandlerTags.clear();
  };

  const detachHandlers = (
    oldHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>
  ) => {
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
      attachedNativeHandlers.current.delete(tag);
      attachedHandlerTags.delete(tag);
    });
  };

  const attachHandlers = (
    viewRef: RefObject<Element | null>,
    propsRef: RefObject<PropsRef>,
    currentHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>,
    actionType: ActionType
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
          actionType,
          propsRef
        );
        attachedNativeHandlers.current.add(tag);
      } else {
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current,
          actionType,
          propsRef
        );
      }
      attachedHandlerTags.add(tag);
    });
  };

  useEffect(() => {
    detachHandlers(attachedNativeHandlers.current, attachedHandlers.current);
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
      attachedHandlers.current,
      ActionType.NATIVE_DETECTOR
    );
  }, [handlerTags, children]);

  useEffect(() => {
    const logicHandlersToDetach: Set<number> = new Set(
      attachedLogicHandlers.current.keys()
    );

    props.logicChildren?.forEach((child) => {
      if (!attachedLogicHandlers.current.has(child.viewTag)) {
        attachedLogicHandlers.current.set(child.viewTag, new Set());
      }
      logicHandlersToDetach.delete(child.viewTag);
      attachHandlers(
        child.viewRef,
        propsRef,
        new Set(child.handlerTags),
        attachedLogicHandlers.current.get(child.viewTag)!,
        ActionType.LOGIC_DETECTOR
      );
    });

    logicHandlersToDetach.forEach((tag) => {
      detachAllHandlers(attachedLogicHandlers.current.get(tag)!);
    });
  }, [props.logicChildren]);

  useEffect(() => {
    return () => {
      detachAllHandlers(attachedHandlers.current);
      attachedLogicHandlers?.current.forEach((childHandlerTags) => {
        detachAllHandlers(childHandlerTags);
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
