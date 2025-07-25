import { useEffect, useRef } from 'react';
import {
  GestureHandlerStateChangeEvent,
  GestureHandlerTouchEvent,
  GestureHandlerEvent,
} from './interfaces';
import { View } from 'react-native';
import RNGestureHandlerModuleWeb from '../RNGestureHandlerModule.web';
import { ActionType } from '../ActionType';
export interface GestureHandlerDetectorProps {
  onGestureHandlerEvent?: (e: GestureHandlerEvent) => void;
  onGestureHandlerAnimatedEvent?: (e: GestureHandlerEvent) => void;
  onGestureHandlerStateChange?: (e: GestureHandlerStateChangeEvent) => void;
  onGestureHandlerTouchEvent?: (e: GestureHandlerTouchEvent) => void;

  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
  children?: React.ReactNode;
}

const GestureHandlerDetector = (props: GestureHandlerDetectorProps) => {
  const {
    onGestureHandlerEvent,
    onGestureHandlerAnimatedEvent,
    onGestureHandlerStateChange,
    onGestureHandlerTouchEvent,
    handlerTags,
    dispatchesAnimatedEvents,
    moduleId,
    children,
  } = props;

  const viewRef = useRef(null);
  const propsRef = useRef<GestureHandlerDetectorProps>(props);

  useEffect(() => {
    attachHandlers();
  }, [
    onGestureHandlerEvent,
    onGestureHandlerAnimatedEvent,
    onGestureHandlerStateChange,
    onGestureHandlerTouchEvent,
    handlerTags,
    dispatchesAnimatedEvents,
    moduleId,
  ]);

  const attachHandlers = (): void => {
    handlerTags.forEach((tag) => {
      RNGestureHandlerModuleWeb.attachGestureHandler(
        tag,
        viewRef.current,
        ActionType.NATIVE_ANIMATED_EVENT, // TODO: find proper ActionType
        propsRef
      );
    });
  };
  return <View ref={viewRef}>{children}</View>;
};

export default GestureHandlerDetector;
