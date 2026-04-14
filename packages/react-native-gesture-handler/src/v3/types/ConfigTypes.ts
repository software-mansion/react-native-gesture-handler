import {
  ActiveCursor,
  GestureTouchEvent,
  HitSlop,
  MouseButton,
  TouchAction,
  UserSelect,
} from '../../handlers/gestureHandlerCommon';
import {
  AnimatedEvent,
  ChangeCalculatorType,
  GestureEndEvent,
  GestureEvent,
} from './EventTypes';
import { WithSharedValue } from './ReanimatedTypes';

export type GestureEventCallback<THandlerData> = (
  event: GestureEvent<THandlerData>
) => void;

export type GestureEndEventCallback<THandlerData> = (
  event: GestureEndEvent<THandlerData>
) => void;

export type GestureTouchEventCallback = (event: GestureTouchEvent) => void;

export type GestureCallbacks<
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
> = {
  onBegin?: GestureEventCallback<THandlerData> | undefined;
  onActivate?: GestureEventCallback<TExtendedHandlerData> | undefined;
  onUpdate?:
    | GestureEventCallback<TExtendedHandlerData>
    | AnimatedEvent
    | undefined;
  onDeactivate?: GestureEndEventCallback<TExtendedHandlerData> | undefined;
  onFinalize?: GestureEndEventCallback<THandlerData> | undefined;
  onTouchesDown?: GestureTouchEventCallback | undefined;
  onTouchesMove?: GestureTouchEventCallback | undefined;
  onTouchesUp?: GestureTouchEventCallback | undefined;
  onTouchesCancel?: GestureTouchEventCallback | undefined;
};

export type GestureRelations = {
  simultaneousHandlers: number[];
  waitFor: number[];
  blocksHandlers: number[];
};

export type InternalConfigProps<TExtendedHandlerData> = {
  shouldUseReanimatedDetector?: boolean | undefined;
  dispatchesReanimatedEvents?: boolean | undefined;
  dispatchesAnimatedEvents?: boolean | undefined;
  needsPointerData?: boolean | undefined;
  userSelect?: UserSelect | undefined;
  touchAction?: TouchAction | undefined;
  enableContextMenu?: boolean | undefined;
  changeEventCalculator?:
    | ChangeCalculatorType<TExtendedHandlerData>
    | undefined;
  fillInDefaultValues?:
    | ((event: GestureEvent<TExtendedHandlerData>) => void)
    | undefined;
};

export type CommonGestureConfig = {
  disableReanimated?: boolean | undefined;
  useAnimated?: boolean | undefined;
  testID?: string | undefined;
} & WithSharedValue<
  {
    runOnJS?: boolean | undefined;
    enabled?: boolean | undefined;
    shouldCancelWhenOutside?: boolean | undefined;
    hitSlop?: HitSlop | undefined;
    activeCursor?: ActiveCursor | undefined;
    mouseButton?: MouseButton | undefined;
    cancelsTouchesInView?: boolean | undefined;
    manualActivation?: boolean | undefined;
  },
  ActiveCursor | MouseButton
>;

export type ComposedGestureConfig = {
  shouldUseReanimatedDetector: boolean;
  dispatchesAnimatedEvents: boolean;
};
