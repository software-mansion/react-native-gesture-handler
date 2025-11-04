import React, { Ref, RefObject, useEffect, useRef } from 'react';
import RNGestureHandlerModule from '../../RNGestureHandlerModule.web';
import { ActionType } from '../../ActionType';
import { PropsRef } from '../../web/interfaces';
import { View } from 'react-native';
import { tagMessage } from '../../utils';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
  virtualChildren?: Set<VirtualChildrenWeb>;
}

export interface VirtualChildrenWeb {
  viewTag: number;
  handlerTags: number[];
  viewRef: RefObject<Element | null>;
}

const EMPTY_HANDLERS = new Set<number>();

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef<Element>(null);
  const propsRef = useRef<PropsRef>(props);
  const attachedHandlers = useRef<Set<number>>(new Set<number>());
  const attachedNativeHandlers = useRef<Set<number>>(new Set<number>());
  const attachedVirtualHandlers = useRef<Map<number, Set<number>>>(new Map());

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
        ).shouldAttachGestureToChildView() &&
        actionType === ActionType.NATIVE_DETECTOR
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
      detachHandlers(EMPTY_HANDLERS, attachedHandlers.current);
      attachedVirtualHandlers?.current.forEach((childHandlerTags) => {
        detachHandlers(EMPTY_HANDLERS, childHandlerTags);
      });
    };
  }, [handlerTags, children]);

  useEffect(() => {
    const virtualChildrenToDetach: Set<number> = new Set(
      attachedVirtualHandlers.current.keys()
    );

    props.virtualChildren?.forEach((child) => {
      virtualChildrenToDetach.delete(child.viewTag);
    });

    virtualChildrenToDetach.forEach((tag) => {
      detachHandlers(EMPTY_HANDLERS, attachedVirtualHandlers.current.get(tag)!);
    });

    props.virtualChildren?.forEach((child) => {
      if (child.viewRef.current == null) {
        // We must check whether viewRef is  not null as otherwise we get an error when intercepting gesture detector
        // switches its component based on whether animated/reanimated events should run.
        return;
      }
      if (!attachedVirtualHandlers.current.has(child.viewTag)) {
        attachedVirtualHandlers.current.set(child.viewTag, new Set());
      }

      const currentHandlerTags = new Set(child.handlerTags);
      detachHandlers(
        currentHandlerTags,
        attachedVirtualHandlers.current.get(child.viewTag)!
      );

      attachHandlers(
        child.viewRef,
        propsRef,
        currentHandlerTags,
        attachedVirtualHandlers.current.get(child.viewTag)!,
        ActionType.VIRTUAL_DETECTOR
      );
    });
  }, [props.virtualChildren]);

  return (
    <View style={{ display: 'contents' }} ref={viewRef as Ref<View>}>
      {children}
    </View>
  );
};

export default HostGestureDetector;
