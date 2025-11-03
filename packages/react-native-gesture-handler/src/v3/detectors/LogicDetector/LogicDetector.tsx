import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Wrap } from '../../../handlers/gestures/GestureDetector/Wrap';
import { findNodeHandle, Platform } from 'react-native';
import { useDetectorContext } from './useDetectorContext';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import { NativeDetectorProps } from '../common';
import { configureRelations } from '../utils';
import { tagMessage } from '../../../utils';
import { DetectorCallbacks } from '../../types';

export function LogicDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig>
) {
  const context = useDetectorContext();
  if (!context) {
    throw new Error(
      tagMessage(
        'Logic detector must be a descendant of an InterceptingGestureDecector'
      )
    );
  }
  const { register, unregister } = context;

  const viewRef = useRef(null);
  const [viewTag, setViewTag] = useState<number>(-1);
  const logicMethods = useRef(props.gesture.detectorCallbacks);

  const handleRef = useCallback(
    (node: any) => {
      viewRef.current = node;
      if (!node) {
        return;
      }

      const tag = Platform.OS === 'web' ? node : findNodeHandle(node);

      if (tag != null) {
        setViewTag(tag);
      }

      return () => {
        if (tag != null) {
          const handlerTags = isComposedGesture(props.gesture)
            ? props.gesture.tags
            : [props.gesture.tag];

          unregister(viewTag, handlerTags);
        }
      };
    },
    [props.children]
  );

  useEffect(() => {
    logicMethods.current = props.gesture.detectorCallbacks;
  }, [props.gesture.detectorCallbacks]);

  useEffect(() => {
    if (viewTag === -1) {
      return;
    }

    const handlerTags = isComposedGesture(props.gesture)
      ? props.gesture.tags
      : [props.gesture.tag];

    const logicProps = {
      viewTag,
      handlerTags,
    };

    if (Platform.OS === 'web') {
      Object.assign(logicProps, { viewRef });
    }

    register(
      logicProps,
      logicMethods as RefObject<DetectorCallbacks<unknown>>,
      props.gesture.config.shouldUseReanimatedDetector,
      props.gesture.config.dispatchesAnimatedEvents
    );

    return () => {
      unregister(viewTag, handlerTags);
    };
  }, [viewTag, props.gesture, register, unregister]);

  configureRelations(props.gesture);

  return <Wrap ref={handleRef}>{props.children}</Wrap>;
}
