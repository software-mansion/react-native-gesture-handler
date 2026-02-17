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

export type GestureEventCallbackWithDidSucceed<THandlerData> = (
  event: GestureEvent<THandlerData>,
  didSucceed: boolean
) => void;

export type GestureTouchEventCallback = (event: GestureTouchEvent) => void;

export type GestureCallbacks<
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
> = {
  onBegin?: GestureEventCallback<THandlerData>;
  onActivate?: GestureEventCallback<TExtendedHandlerData>;
  onUpdate?: GestureEventCallback<TExtendedHandlerData> | AnimatedEvent;
  onDeactivate?: GestureEventCallbackWithDidSucceed<TExtendedHandlerData>;
  onFinalize?: GestureEventCallbackWithDidSucceed<THandlerData>;
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
  ActiveCursor | MouseButton
>;

export type ComposedGestureConfig = {
  shouldUseReanimatedDetector: boolean;
  dispatchesAnimatedEvents: boolean;
};
