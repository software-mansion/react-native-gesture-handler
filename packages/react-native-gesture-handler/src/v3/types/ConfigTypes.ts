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

export type GestureCallbacks<THandlerData> = {
  onBegin?: GestureEventCallback<THandlerData>;
  onActivate?: GestureEventCallback<THandlerData>;
  onDeactivate?: GestureEndEventCallback<THandlerData>;
  onFinalize?: GestureEndEventCallback<THandlerData>;
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
  userSelect?: UserSelect;
  touchAction?: TouchAction;
  enableContextMenu?: boolean;
  changeEventCalculator?: ChangeCalculatorType<THandlerData>;
};

export type CommonGestureConfig = {
  disableReanimated?: boolean;
  useAnimated?: boolean;
  testID?: string;
} & WithSharedValue<
  {
    runOnJS?: boolean;
    enabled?: boolean;
    shouldCancelWhenOutside?: boolean;
    hitSlop?: HitSlop;
    activeCursor?: ActiveCursor;
    mouseButton?: MouseButton;
    cancelsTouchesInView?: boolean;
    manualActivation?: boolean;
  },
  HitSlop | ActiveCursor | MouseButton
>;

export type ComposedGestureConfig = {
  shouldUseReanimatedDetector: boolean;
  dispatchesAnimatedEvents: boolean;
};
