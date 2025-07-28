import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import RNGestureHandlerModuleWeb from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
export interface GestureHandlerDetectorProps {
  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const viewRef = useRef(null);
  const propsRef = useRef<GestureHandlerDetectorProps>(props);
  const oldHandlerTags = useRef<Set<number>>(new Set<number>());

  const attachHandlers = (): void => {
    const curHandlerTags = new Set(handlerTags);
    const newHandlerTags: Set<number> = curHandlerTags.difference(
      oldHandlerTags.current
    );
    newHandlerTags.forEach((tag) => {
      RNGestureHandlerModuleWeb.attachGestureHandler(
        tag,
        viewRef.current,
        ActionType.NATIVE_DETECTOR,
        propsRef
      );
    });
  };

  const detachHandlers = (): void => {
    handlerTags.forEach((tag) => {
      RNGestureHandlerModuleWeb.detachGestureHandler(tag);
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
