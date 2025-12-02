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
  GestureEvent,
} from './EventTypes';
import { WithSharedValue } from './ReanimatedTypes';

export type GestureEventCallback<THandlerData> = (
  event: GestureEvent<THandlerData>
) => void;

export type GestureEventCallbackWithSuccess<THandlerData> = (
  event: GestureEvent<THandlerData>,
  didSucceed: boolean
) => void;

export type GestureTouchEventCallback = (event: GestureTouchEvent) => void;

export type GestureCallbacks<THandlerData> = {
  onBegin?: GestureEventCallback<THandlerData>;
  onActivate?: GestureEventCallback<THandlerData>;
  onDeactivate?: GestureEventCallbackWithSuccess<THandlerData>;
  onFinalize?: GestureEventCallbackWithSuccess<THandlerData>;
  onUpdate?: GestureEventCallback<THandlerData> | AnimatedEvent;
  onTouchesDown?: GestureTouchEventCallback;
  onTouchesMove?: GestureTouchEventCallback;
  onTouchesUp?: GestureTouchEventCallback;
  onTouchesCancel?: GestureTouchEventCallback;
};

export type GestureRelations = {
  simultaneousHandlers: number[];
  waitFor: number[];
  blocksHandlers: number[];
};

export type InternalConfigProps<THandlerData> = {
  shouldUseReanimatedDetector?: boolean;
  dispatchesReanimatedEvents?: boolean;
  dispatchesAnimatedEvents?: boolean;
  needsPointerData?: boolean;
  changeEventCalculator?: ChangeCalculatorType<THandlerData>;
};

export type CommonGestureConfig = {
  disableReanimated?: boolean;
  useAnimated?: boolean;
} & WithSharedValue<
  {
    runOnJS?: boolean;
    enabled?: boolean;
    shouldCancelWhenOutside?: boolean;
    hitSlop?: HitSlop;
    userSelect?: UserSelect;
    activeCursor?: ActiveCursor;
    mouseButton?: MouseButton;
    enableContextMenu?: boolean;
    touchAction?: TouchAction;
  },
  HitSlop | UserSelect | ActiveCursor | MouseButton | TouchAction
>;

export type ComposedGestureConfig = {
  shouldUseReanimatedDetector: boolean;
  dispatchesAnimatedEvents: boolean;
};
