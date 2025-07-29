import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
export interface GestureHandlerDetectorProps {
  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
  actionType?: ActionType;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const {
    handlerTags,
    children,
    actionType = ActionType.NATIVE_DETECTOR,
  } = props;

  const viewRef = useRef(null);
  const propsRef = useRef<GestureHandlerDetectorProps>(props);
  const oldHandlerTags = useRef<Set<number>>(new Set<number>());

  const attachHandlers = () => {
    const currentHandlerTags = new Set(handlerTags);
    const newHandlerTags = currentHandlerTags.difference(
      oldHandlerTags.current
    );
    newHandlerTags.forEach((tag) => {
      RNGestureHandlerModule.attachGestureHandler(
        tag,
        viewRef.current,
        actionType,
        propsRef
      );
    });
    oldHandlerTags.current = currentHandlerTags;
  };

  const detachHandlers = () => {
    handlerTags.forEach((tag) => {
      RNGestureHandlerModule.detachGestureHandler(tag);
    });
  };

  useEffect(() => {
    attachHandlers();
    return () => {
      detachHandlers();
    };
  }, [attachHandlers, detachHandlers]);

  return <View ref={viewRef}>{children}</View>;
};

export default HostGestureDetector;
