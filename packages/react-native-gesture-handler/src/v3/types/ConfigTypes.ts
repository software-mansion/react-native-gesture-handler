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

export type GestureCallbacks<THandlerData> = {
  onBegin?: (event: GestureEvent<THandlerData>) => void;
  onActivate?: (event: GestureEvent<THandlerData>) => void;
  onDeactivate?: (
    event: GestureEvent<THandlerData>,
    didSucceed: boolean
  ) => void;
  onFinalize?: (event: GestureEvent<THandlerData>, didSucceed: boolean) => void;
  onUpdate?: ((event: GestureEvent<THandlerData>) => void) | AnimatedEvent;
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
