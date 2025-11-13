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
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from './EventTypes';
import { WithSharedValue } from './ReanimatedTypes';

export type GestureCallbacks<THandlerData> = {
  onBegin?: (event: GestureStateChangeEvent<THandlerData>) => void;
  onStart?: (event: GestureStateChangeEvent<THandlerData>) => void;
  onEnd?: (
    event: GestureStateChangeEvent<THandlerData>,
    didSucceed: boolean
  ) => void;
  onFinalize?: (
    event: GestureStateChangeEvent<THandlerData>,
    didSucceed: boolean
  ) => void;
  onUpdate?: (event: GestureUpdateEvent<THandlerData>) => void | AnimatedEvent;
  onTouchesDown?: (event: GestureTouchEvent) => void;
  onTouchesMove?: (event: GestureTouchEvent) => void;
  onTouchesUp?: (event: GestureTouchEvent) => void;
  onTouchesCancel?: (event: GestureTouchEvent) => void;
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
