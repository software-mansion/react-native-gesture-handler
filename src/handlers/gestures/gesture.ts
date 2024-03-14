import { FlingGestureHandlerEventPayload } from '../FlingGestureHandler';
import { ForceTouchGestureHandlerEventPayload } from '../ForceTouchGestureHandler';
import {
  HitSlop,
  CommonGestureConfig,
  GestureTouchEvent,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  ActiveCursor,
  MouseButton,
} from '../gestureHandlerCommon';
import { getNextHandlerTag } from '../handlersRegistry';
import { GestureStateManagerType } from './gestureStateManager';
import { LongPressGestureHandlerEventPayload } from '../LongPressGestureHandler';
import { PanGestureHandlerEventPayload } from '../PanGestureHandler';
import { PinchGestureHandlerEventPayload } from '../PinchGestureHandler';
import { RotationGestureHandlerEventPayload } from '../RotationGestureHandler';
import { TapGestureHandlerEventPayload } from '../TapGestureHandler';
import { NativeViewGestureHandlerPayload } from '../NativeViewGestureHandler';
import { isRemoteDebuggingEnabled } from '../../utils';

export type GestureType =
  | BaseGesture<Record<string, unknown>>
  | BaseGesture<Record<string, never>>
  | BaseGesture<TapGestureHandlerEventPayload>
  | BaseGesture<PanGestureHandlerEventPayload>
  | BaseGesture<LongPressGestureHandlerEventPayload>
  | BaseGesture<RotationGestureHandlerEventPayload>
  | BaseGesture<PinchGestureHandlerEventPayload>
  | BaseGesture<FlingGestureHandlerEventPayload>
  | BaseGesture<ForceTouchGestureHandlerEventPayload>
  | BaseGesture<NativeViewGestureHandlerPayload>;

export type GestureRef =
  | number
  | GestureType
  | React.RefObject<GestureType | undefined>
  | React.RefObject<React.ComponentType | undefined>; // allow adding a ref to a gesture handler
export interface BaseGestureConfig
  extends CommonGestureConfig,
    Record<string, unknown> {
  ref?: React.MutableRefObject<GestureType | undefined>;
  requireToFail?: GestureRef[];
  simultaneousWith?: GestureRef[];
  blocksHandlers?: GestureRef[];
  needsPointerData?: boolean;
  manualActivation?: boolean;
  runOnJS?: boolean;
  testId?: string;
  cancelsTouchesInView?: boolean;
}

type TouchEventHandlerType = (
  event: GestureTouchEvent,
  stateManager: GestureStateManagerType
) => void;

export type HandlerCallbacks<EventPayloadT extends Record<string, unknown>> = {
  gestureId: number;
  handlerTag: number;
  onBegin?: (event: GestureStateChangeEvent<EventPayloadT>) => void;
  onStart?: (event: GestureStateChangeEvent<EventPayloadT>) => void;
  onEnd?: (
    event: GestureStateChangeEvent<EventPayloadT>,
    success: boolean
  ) => void;
  onFinalize?: (
    event: GestureStateChangeEvent<EventPayloadT>,
    success: boolean
  ) => void;
  onUpdate?: (event: GestureUpdateEvent<EventPayloadT>) => void;
  onChange?: (event: any) => void;
  onTouchesDown?: TouchEventHandlerType;
  onTouchesMove?: TouchEventHandlerType;
  onTouchesUp?: TouchEventHandlerType;
  onTouchesCancelled?: TouchEventHandlerType;
  changeEventCalculator?: (
    current: GestureUpdateEvent<Record<string, unknown>>,
    previous?: GestureUpdateEvent<Record<string, unknown>>
  ) => GestureUpdateEvent<Record<string, unknown>>;
  isWorklet: boolean[];
};

export const CALLBACK_TYPE = {
  UNDEFINED: 0,
  BEGAN: 1,
  START: 2,
  UPDATE: 3,
  CHANGE: 4,
  END: 5,
  FINALIZE: 6,
  TOUCHES_DOWN: 7,
  TOUCHES_MOVE: 8,
  TOUCHES_UP: 9,
  TOUCHES_CANCELLED: 10,
} as const;

// Allow using CALLBACK_TYPE as object and type
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type CALLBACK_TYPE = typeof CALLBACK_TYPE[keyof typeof CALLBACK_TYPE];

export abstract class Gesture {
  /**
   * Return array of gestures, providing the same interface for creating and updating
   * handlers, no matter which object was used to create gesture instance.
   */
  abstract toGestureArray(): GestureType[];

  /**
   * Assign handlerTag to the gesture instance and set ref.current (if a ref is set)
   */
  abstract initialize(): void;

  /**
   * Make sure that values of properties defining relations are arrays. Do any necessary
   * preprocessing required to configure relations between handlers. Called just before
   * updating the handler on the native side.
   */
  abstract prepare(): void;
}

let nextGestureId = 0;
export abstract class BaseGesture<
  EventPayloadT extends Record<string, unknown>
> extends Gesture {
  private gestureId = -1;
  public handlerTag = -1;
  public handlerName = '';
  public config: BaseGestureConfig = {};
  public handlers: HandlerCallbacks<EventPayloadT> = {
    gestureId: -1,
    handlerTag: -1,
    isWorklet: [],
  };

  constructor() {
    super();

    // Used to check whether the gesture config has been updated when wrapping it
    // with `useMemo`. Since every config will have a unique id, when the dependencies
    // don't change, the config won't be recreated and the id will stay the same.
    // If the id is different, it means that the config has changed and the gesture
    // needs to be updated.
    this.gestureId = nextGestureId++;
    this.handlers.gestureId = this.gestureId;
  }

  private addDependency(
    key: 'simultaneousWith' | 'requireToFail' | 'blocksHandlers',
    gesture: Exclude<GestureRef, number>
  ) {
    const value = this.config[key];
    this.config[key] = value
      ? Array<GestureRef>().concat(value, gesture)
      : [gesture];
  }

  withRef(ref: React.MutableRefObject<GestureType | undefined>) {
    this.config.ref = ref;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected isWorklet(callback: Function) {
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    return callback.__workletHash !== undefined;
  }

  onBegin(callback: (event: GestureStateChangeEvent<EventPayloadT>) => void) {
    this.handlers.onBegin = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.BEGAN] = this.isWorklet(callback);
    return this;
  }

  onStart(callback: (event: GestureStateChangeEvent<EventPayloadT>) => void) {
    this.handlers.onStart = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.START] = this.isWorklet(callback);
    return this;
  }

  onEnd(
    callback: (
      event: GestureStateChangeEvent<EventPayloadT>,
      success: boolean
    ) => void
  ) {
    this.handlers.onEnd = callback;
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    this.handlers.isWorklet[CALLBACK_TYPE.END] = this.isWorklet(callback);
    return this;
  }

  onFinalize(
    callback: (
      event: GestureStateChangeEvent<EventPayloadT>,
      success: boolean
    ) => void
  ) {
    this.handlers.onFinalize = callback;
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    this.handlers.isWorklet[CALLBACK_TYPE.FINALIZE] = this.isWorklet(callback);
    return this;
  }

  onTouchesDown(callback: TouchEventHandlerType) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesDown = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_DOWN] =
      this.isWorklet(callback);

    return this;
  }

  onTouchesMove(callback: TouchEventHandlerType) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesMove = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_MOVE] =
      this.isWorklet(callback);

    return this;
  }

  onTouchesUp(callback: TouchEventHandlerType) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesUp = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_UP] =
      this.isWorklet(callback);

    return this;
  }

  onTouchesCancelled(callback: TouchEventHandlerType) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesCancelled = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_CANCELLED] =
      this.isWorklet(callback);

    return this;
  }

  enabled(enabled: boolean) {
    this.config.enabled = enabled;
    return this;
  }

  shouldCancelWhenOutside(value: boolean) {
    this.config.shouldCancelWhenOutside = value;
    return this;
  }

  hitSlop(hitSlop: HitSlop) {
    this.config.hitSlop = hitSlop;
    return this;
  }

  activeCursor(activeCursor: ActiveCursor) {
    this.config.activeCursor = activeCursor;
    return this;
  }

  mouseButton(mouseButton: MouseButton) {
    this.config.mouseButton = mouseButton;
    return this;
  }

  runOnJS(runOnJS: boolean) {
    this.config.runOnJS = runOnJS;
    return this;
  }

  simultaneousWithExternalGesture(...gestures: Exclude<GestureRef, number>[]) {
    for (const gesture of gestures) {
      this.addDependency('simultaneousWith', gesture);
    }
    return this;
  }

  requireExternalGestureToFail(...gestures: Exclude<GestureRef, number>[]) {
    for (const gesture of gestures) {
      this.addDependency('requireToFail', gesture);
    }
    return this;
  }

  blocksExternalGesture(...gestures: Exclude<GestureRef, number>[]) {
    for (const gesture of gestures) {
      this.addDependency('blocksHandlers', gesture);
    }
    return this;
  }

  withTestId(id: string) {
    this.config.testId = id;
    return this;
  }

  cancelsTouchesInView(value: boolean) {
    this.config.cancelsTouchesInView = value;
    return this;
  }

  initialize() {
    this.handlerTag = getNextHandlerTag();

    this.handlers = { ...this.handlers, handlerTag: this.handlerTag };

    if (this.config.ref) {
      this.config.ref.current = this as GestureType;
    }
  }

  toGestureArray(): GestureType[] {
    return [this as GestureType];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  prepare() {}

  get shouldUseReanimated(): boolean {
    // use Reanimated when runOnJS isn't set explicitly,
    // and all defined callbacks are worklets,
    // and remote debugging is disabled
    return (
      this.config.runOnJS !== true &&
      !this.handlers.isWorklet.includes(false) &&
      !isRemoteDebuggingEnabled()
    );
  }
}

export abstract class ContinousBaseGesture<
  EventPayloadT extends Record<string, unknown>,
  EventChangePayloadT extends Record<string, unknown>
> extends BaseGesture<EventPayloadT> {
  onUpdate(callback: (event: GestureUpdateEvent<EventPayloadT>) => void) {
    this.handlers.onUpdate = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.UPDATE] = this.isWorklet(callback);
    return this;
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<EventPayloadT & EventChangePayloadT>
    ) => void
  ) {
    this.handlers.onChange = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.CHANGE] = this.isWorklet(callback);
    return this;
  }

  manualActivation(manualActivation: boolean) {
    this.config.manualActivation = manualActivation;
    return this;
  }
}
