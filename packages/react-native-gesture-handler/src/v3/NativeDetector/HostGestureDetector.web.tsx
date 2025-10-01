import React, { Ref, RefObject, useEffect, useRef } from 'react';
import RNGestureHandlerModule from '../../RNGestureHandlerModule.web';
import { ActionType } from '../../ActionType';
import { PropsRef } from '../../web/interfaces';
import { View } from 'react-native';
import { tagMessage } from '../../utils';
import { EMPTY_SET } from './utils';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
  logicChildren?: Set<LogicChildrenWeb>;
}

export interface LogicChildrenWeb {
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

  const detachHandlers = (
    currentHandlerTags: Set<number>,
    attachedHandlerTags: Set<number>
  ) => {
    const oldHandlerTags = attachedHandlerTags.difference(currentHandlerTags);
    oldHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
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
    const newHandlerTags = currentHandlerTags.difference(attachedHandlerTags);

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
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (React.Children.count(children) !== 1) {
      throw new Error(
        tagMessage('Detector expected to have exactly one child element')
      );
    }

    const currentHandlerTags = new Set(handlerTags);
    detachHandlers(currentHandlerTags, attachedHandlers.current);

    attachHandlers(
      viewRef,
      propsRef,
      currentHandlerTags,
      attachedHandlers.current,
      ActionType.NATIVE_DETECTOR
    );

    return () => {
      detachHandlers(EMPTY_SET, attachedHandlers.current);
      attachedLogicHandlers?.current.forEach((childHandlerTags) => {
        detachHandlers(EMPTY_SET, childHandlerTags);
      });
    };
  }, [handlerTags, children]);

  useEffect(() => {
    const logicChildrenToDetach: Set<number> = new Set(
      attachedLogicHandlers.current.keys()
    );

    props.logicChildren?.forEach((child) => {
      if (!attachedLogicHandlers.current.has(child.viewTag)) {
        attachedLogicHandlers.current.set(child.viewTag, new Set());
      }
      logicChildrenToDetach.delete(child.viewTag);

      const currentHandlerTags = new Set(child.handlerTags);
      detachHandlers(
        currentHandlerTags,
        attachedLogicHandlers.current.get(child.viewTag)!
      );

      attachHandlers(
        child.viewRef,
        propsRef,
        currentHandlerTags,
        attachedLogicHandlers.current.get(child.viewTag)!,
        ActionType.LOGIC_DETECTOR
      );
    });

    logicChildrenToDetach.forEach((tag) => {
      detachHandlers(EMPTY_SET, attachedLogicHandlers.current.get(tag)!);
    });
  }, [props.logicChildren]);

  return (
    <View style={{ display: 'contents' }} ref={viewRef as Ref<View>}>
      {children}
    </View>
  );
};

export default HostGestureDetector;
