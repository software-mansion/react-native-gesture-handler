import { useEffect, useMemo, useRef } from 'react';
import {
  NativeEventsManager,
  Reanimated,
} from '../../handlers/gestures/reanimatedWrapper';
import HostGestureDetector, {
  type RNGestureHandlerDetectorNativeComponentProps,
} from './HostGestureDetector';
import { findNodeHandle } from 'react-native';

let NativeEventsManagerImpl = Reanimated?.NativeEventsManager;

if (!NativeEventsManagerImpl) {
  // Fallback to empty object when Reanimated or NativeEventsManager is not available
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    NativeEventsManagerImpl =
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
      require('react-native-reanimated/src/createAnimatedComponent/NativeEventsManager').NativeEventsManager;
  } catch {
    // fail silently
  }
}

type WorkletProps = Pick<
  RNGestureHandlerDetectorNativeComponentProps,
  | 'onGestureHandlerReanimatedStateChange'
  | 'onGestureHandlerReanimatedEvent'
  | 'onGestureHandlerReanimatedTouchEvent'
>;

function LeanReanimatedNativeDetector(
  props: RNGestureHandlerDetectorNativeComponentProps
) {
  const prevProps = useRef<WorkletProps>(null);
  const eventManager = useRef<InstanceType<NativeEventsManager> | null>(null);
  const viewRef = useRef<any>(null);

  const {
    onGestureHandlerReanimatedStateChange,
    onGestureHandlerReanimatedEvent,
    onGestureHandlerReanimatedTouchEvent,
    ...restProps
  } = props;

  const reaProps: WorkletProps = useMemo(
    () => ({
      onGestureHandlerReanimatedStateChange,
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedEvent,
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedTouchEvent,
    }),
    [
      onGestureHandlerReanimatedEvent,
      onGestureHandlerReanimatedStateChange,
      onGestureHandlerReanimatedTouchEvent,
    ]
  );

  useEffect(() => {
    const nativeTag = findNodeHandle(viewRef.current) ?? -1;
    // @ts-expect-error Reanimated expects __nativeTag to be present on the ref
    viewRef.__nativeTag = nativeTag;
    // @ts-expect-error NativeEventsManager should be defined here, if it isn't, we should
    // go the fallback way and use Reanimated's createAnimatedComponent
    eventManager.current = new NativeEventsManagerImpl({
      props: reaProps,
      _componentRef: viewRef,
      _componentViewTag: nativeTag,
      getComponentViewTag: () => nativeTag,
    });
    eventManager.current.attachEvents();

    return () => {
      eventManager.current?.detachEvents();
    };
  }, []);

  useEffect(() => {
    if (prevProps.current) {
      eventManager.current?.updateEvents(prevProps.current);
    }
    prevProps.current = reaProps;
  }, [reaProps]);

  return <HostGestureDetector ref={viewRef} {...restProps} />;
}

export const ReanimatedNativeDetector = NativeEventsManagerImpl
  ? LeanReanimatedNativeDetector
  : Reanimated?.default.createAnimatedComponent(HostGestureDetector);
