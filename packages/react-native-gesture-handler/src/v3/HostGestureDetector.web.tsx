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

  const logicChildren = useRef<Map<number, LogicChild>>(new Map());

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
    isLogic: boolean
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
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current!.firstChild,
          ActionType.NATIVE_DETECTOR,
          propsRef
        );
        attachedNativeHandlerTags.add(tag);
      } else {
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          viewRef.current,
          isLogic ? ActionType.LogicDetector : ActionType.NATIVE_DETECTOR,
          propsRef
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
      attachedNativeHandlerTags.current,
      false
    );
  }, [handlerTags, children]);

  useEffect(() => {
    const shouldKeepLogicChild: Map<number, boolean> = new Map();

    for (const key of logicChildren.current.keys()) {
      shouldKeepLogicChild.set(key, false);
    }

    props.logicChildren?.forEach((child, key) => {
      if (!logicChildren.current.has(child.viewTag)) {
        logicChildren.current.set(child.viewTag, {
          attachedHandlerTags: new Set(),
          attachedNativeHandlerTags: new Set(),
        });
      }
      shouldKeepLogicChild.set(key.viewTag, true);
      const attachedHandlerTags = logicChildren.current.get(
        child.viewTag
      )?.attachedHandlerTags;
      const attachedNativeHandlerTags = logicChildren.current.get(
        child.viewTag
      )?.attachedNativeHandlerTags;
      if (attachedHandlerTags && attachedNativeHandlerTags) {
        attachHandlers(
          child.viewRef,
          propsRef,
          new Set(child.handlerTags),
          attachedHandlerTags,
          attachedNativeHandlerTags,
          true
        );
      }
    });

    shouldKeepLogicChild.forEach((value, key) => {
      if (value) {
        const attachedHandlerTags =
          logicChildren.current.get(key)?.attachedHandlerTags;
        const attachedNativeHandlerTags =
          logicChildren.current.get(key)?.attachedNativeHandlerTags;
        if (attachedHandlerTags && attachedNativeHandlerTags) {
          detachHandlers(
            attachedHandlerTags,
            attachedHandlerTags,
            attachedNativeHandlerTags
          );
        }
      }
    });
  }, [props.logicChildren]);

  useEffect(() => {
    return () => {
      detachHandlers(
        attachedHandlerTags.current,
        attachedHandlerTags.current,
        attachedNativeHandlerTags.current
      );
      logicChildren?.current.forEach((child) => {
        detachHandlers(
          child.attachedHandlerTags,
          child.attachedHandlerTags,
          child.attachedNativeHandlerTags
        );
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
