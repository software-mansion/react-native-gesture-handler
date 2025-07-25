import { useEffect, useRef } from 'react';
import {
  GestureHandlerStateChangeEvent,
  GestureHandlerTouchEvent,
  GestureHandlerEvent,
} from '../interfaces';
import { View, ViewProps } from 'react-native';
import RNGestureHandlerModuleWeb from '../../RNGestureHandlerModule.web';
import { ActionType } from '../../ActionType';
export interface GestureHandlerDetectorProps extends ViewProps {
  onGestureHandlerEvent?: (e: GestureHandlerEvent) => void;
  onGestureHandlerAnimatedEvent?: (e: GestureHandlerEvent) => void;
  onGestureHandlerStateChange?: (e: GestureHandlerStateChangeEvent) => void;
  onGestureHandlerTouchEvent?: (e: GestureHandlerTouchEvent) => void;

  handlerTags: number[];
  dispatchesAnimatedEvents: boolean;
  moduleId: number;
}
const GestureHandlerDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags } = props;

  const viewRef = useRef(null);
  const propsRef = useRef<GestureHandlerDetectorProps>(props);

  useEffect(() => {
    updateProps();
  }, [props]);

  const updateProps = (): void => {
    handlerTags.forEach((tag) => {
      RNGestureHandlerModuleWeb.attachGestureHandler(
        tag,
        viewRef.current,
        ActionType.NATIVE_ANIMATED_EVENT,
        propsRef
      );
    });
  };
  return <View ref={viewRef}>{props.children}</View>;
};
export default GestureHandlerDetector;
