/* eslint-disable @typescript-eslint/no-empty-function */
import { State } from '../../State';
import {
  Config,
  AdaptedEvent,
  PropsRef,
  ResultEvent,
  PointerData,
  EventTypes,
  HitSlop,
  GestureHandlerNativeEvent,
} from '../interfaces';
import EventManager from '../tools/EventManager';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import InteractionManager from '../tools/InteractionManager';
import PointerTracker, { TrackerElement } from '../tools/PointerTracker';
import IGestureHandler from './IGestureHandler';
import {
  ActiveCursor,
  TouchAction,
  UserSelect,
  GestureTouchEvent,
  MouseButton,
} from '../../handlers/gestureHandlerCommon';
import { PointerType } from '../../PointerType';
import { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';
import { ActionType } from '../../ActionType';
import { tagMessage } from '../../utils';
import {
  GestureStateChangeEventWithData,
  GestureUpdateEventWithData,
} from '../../v3/types';
import { TouchEventType } from '../../TouchEventType';

export default abstract class GestureHandler implements IGestureHandler {
  private lastSentState: State | null = null;

  private _state: State = State.UNDETERMINED;

  private _shouldCancelWhenOutside = false;
  private _enabled = false;

  private viewRef: number | null = null;
  private propsRef: React.RefObject<PropsRef> | null = null;
  private actionType: ActionType | null = null;
  private dispatchesAnimatedEvents: boolean = false;
  private _handlerTag!: number;

  private hitSlop?: HitSlop = undefined;
  private manualActivation: boolean = false;
  private mouseButton?: MouseButton = undefined;
  private needsPointerData: boolean = false;
  private _tracker: PointerTracker = new PointerTracker();

  private _enableContextMenu: boolean = false;
  private _activeCursor?: ActiveCursor = undefined;
  private _touchAction?: TouchAction = undefined;
  private _userSelect?: UserSelect = undefined;

  // Orchestrator properties
  private _activationIndex = 0;

  private _awaiting = false;
  private _active = false;

  private _shouldResetProgress = false;
  private _pointerType: PointerType = PointerType.MOUSE;
  private _delegate: GestureHandlerDelegate<unknown, IGestureHandler>;

  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    this._delegate = delegate;
  }

  //
  // Initializing handler
  //

  protected init(
    viewRef: number,
    propsRef: React.RefObject<PropsRef>,
    actionType: ActionType
  ) {
    this.propsRef = propsRef;
    this.viewRef = viewRef;
    this.actionType = actionType;
    this.state = State.UNDETERMINED;
    this.delegate.init(viewRef, this);
  }

  public detach() {
    if (this.state === State.ACTIVE) {
      this.cancel();
    } else {
      this.fail();
    }
    this.propsRef = null;
    this.viewRef = null;
    this.actionType = null;
    this.state = State.UNDETERMINED;
    this.dispatchesAnimatedEvents = false;

    this.delegate.detach();
  }

  public attachEventManager(manager: EventManager<unknown>): void {
    manager.setOnPointerDown(this.onPointerDown.bind(this));
    manager.setOnPointerAdd(this.onPointerAdd.bind(this));
    manager.setOnPointerUp(this.onPointerUp.bind(this));
    manager.setOnPointerRemove(this.onPointerRemove.bind(this));
    manager.setOnPointerMove(this.onPointerMove.bind(this));
    manager.setOnPointerEnter(this.onPointerEnter.bind(this));
    manager.setOnPointerLeave(this.onPointerLeave.bind(this));
    manager.setOnPointerCancel(this.onPointerCancel.bind(this));
    manager.setOnPointerOutOfBounds(this.onPointerOutOfBounds.bind(this));
    manager.setOnPointerMoveOver(this.onPointerMoveOver.bind(this));
    manager.setOnPointerMoveOut(this.onPointerMoveOut.bind(this));
    manager.setOnWheel(this.onWheel.bind(this));

    manager.registerListeners();
  }

  //
  // Resetting handler
  //

  protected onCancel(): void {}
  protected onReset(): void {}
  protected resetProgress(): void {}

  public reset(): void {
    this.tracker.resetTracker();
    this.onReset();
    this.resetProgress();
    this.delegate.reset();
    this.state = State.UNDETERMINED;
  }

  //
  // State logic
  //

  public moveToState(newState: State, sendIfDisabled?: boolean) {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;

    if (
      this.tracker.trackedPointersCount > 0 &&
      this.needsPointerData &&
      this.isFinished()
    ) {
      this.cancelTouches();
    }

    GestureHandlerOrchestrator.instance.onHandlerStateChange(
      this,
      newState,
      oldState,
      sendIfDisabled
    );

    this.onStateChange(newState, oldState);

    if (!this.enabled && this.isFinished()) {
      this.state = State.UNDETERMINED;
    }
  }

  protected onStateChange(_newState: State, _oldState: State): void {}

  public begin(): void {
    if (!this.checkHitSlop()) {
      return;
    }

    if (this.state === State.UNDETERMINED) {
      this.moveToState(State.BEGAN);
    }
  }

  /**
   * @param {boolean} sendIfDisabled - Used when handler becomes disabled. With this flag orchestrator will be forced to send fail event
   */
  public fail(sendIfDisabled?: boolean): void {
    if (this.state === State.ACTIVE || this.state === State.BEGAN) {
      // Here the order of calling the delegate and moveToState is important.
      // At this point we can use currentState as previuos state, because immediately after changing cursor we call moveToState method.
      this.delegate.onFail();

      this.moveToState(State.FAILED, sendIfDisabled);
    }

    this.resetProgress();
  }

  /**
   * @param {boolean} sendIfDisabled - Used when handler becomes disabled. With this flag orchestrator will be forced to send cancel event
   */
  public cancel(sendIfDisabled?: boolean): void {
    if (
      this.state === State.ACTIVE ||
      this.state === State.UNDETERMINED ||
      this.state === State.BEGAN
    ) {
      this.onCancel();

      // Same as above - order matters
      this.delegate.onCancel();

      this.moveToState(State.CANCELLED, sendIfDisabled);
    }
  }

  public activate(force = false) {
    if (
      (this.manualActivation !== true || force) &&
      (this.state === State.UNDETERMINED || this.state === State.BEGAN)
    ) {
      this.delegate.onActivate();
      this.moveToState(State.ACTIVE);
    }
  }

  public end() {
    if (this.state === State.BEGAN || this.state === State.ACTIVE) {
      // Same as above - order matters
      this.delegate.onEnd();

      this.moveToState(State.END);
    }

    this.resetProgress();
  }

  //
  // Methods for orchestrator
  //

  public getShouldResetProgress(): boolean {
    return this.shouldResetProgress;
  }
  public setShouldResetProgress(value: boolean): void {
    this.shouldResetProgress = value;
  }

  public shouldWaitForHandlerFailure(handler: IGestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.instance.shouldWaitForHandlerFailure(
      this,
      handler
    );
  }

  public shouldRequireToWaitForFailure(handler: IGestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.instance.shouldRequireHandlerToWaitForFailure(
      this,
      handler
    );
  }

  public shouldRecognizeSimultaneously(handler: IGestureHandler): boolean {
    if (handler === this) {
      return true;
    }

    return InteractionManager.instance.shouldRecognizeSimultaneously(
      this,
      handler
    );
  }

  public shouldBeCancelledByOther(handler: IGestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.instance.shouldHandlerBeCancelledBy(
      this,
      handler
    );
  }

  public shouldAttachGestureToChildView(): boolean {
    return false;
  }

  //
  // Event actions
  //

  protected onPointerDown(event: AdaptedEvent): void {
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(this);
    this._pointerType = event.pointerType;

    if (this.pointerType === PointerType.TOUCH) {
      GestureHandlerOrchestrator.instance.cancelMouseAndPenGestures(this);
    }

    // TODO: Bring back touch events along with introducing `handleDown` method that will handle handler specific stuff
  }
  // Adding another pointer to existing ones
  protected onPointerAdd(event: AdaptedEvent): void {
    this.tryToSendTouchEvent(event);
  }
  protected onPointerUp(event: AdaptedEvent): void {
    this.tryToSendTouchEvent(event);
  }
  // Removing pointer, when there is more than one pointers
  protected onPointerRemove(event: AdaptedEvent): void {
    this.tryToSendTouchEvent(event);
  }
  protected onPointerMove(event: AdaptedEvent): void {
    this.tryToSendMoveEvent(false, event);
  }
  protected onPointerLeave(event: AdaptedEvent): void {
    if (this.shouldCancelWhenOutside) {
      switch (this.state) {
        case State.ACTIVE:
          this.cancel();
          break;
        case State.BEGAN:
          this.fail();
          break;
      }
      return;
    }

    this.tryToSendTouchEvent(event);
  }
  protected onPointerEnter(event: AdaptedEvent): void {
    this.tryToSendTouchEvent(event);
  }
  protected onPointerCancel(event: AdaptedEvent): void {
    this.tryToSendTouchEvent(event);

    this.cancel();
    this.reset();
  }
  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.tryToSendMoveEvent(true, event);
  }
  protected onPointerMoveOver(_event: AdaptedEvent): void {
    // Used only by hover gesture handler atm
  }
  protected onPointerMoveOut(_event: AdaptedEvent): void {
    // Used only by hover gesture handler atm
  }
  protected onWheel(_event: AdaptedEvent): void {
    // Used only by pan gesture handler
  }
  protected tryToSendMoveEvent(out: boolean, event: AdaptedEvent): void {
    if ((out && this.shouldCancelWhenOutside) || !this.enabled) {
      return;
    }

    if (this.active) {
      this.sendEvent(this.state, this.state);
    }

    this.tryToSendTouchEvent(event);
  }

  protected tryToSendTouchEvent(event: AdaptedEvent): void {
    if (this.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }

  public sendTouchEvent(event: AdaptedEvent): void {
    if (!this.enabled) {
      return;
    }
    this.ensurePropsRef();
    const { onGestureHandlerEvent, onGestureHandlerTouchEvent }: PropsRef =
      this.propsRef!.current;

    const touchEvent: ResultEvent<GestureTouchEvent> | undefined =
      this.transformTouchEvent(event);

    if (touchEvent) {
      if (
        onGestureHandlerTouchEvent &&
        this.actionType === ActionType.NATIVE_DETECTOR
      ) {
        invokeNullableMethod(onGestureHandlerTouchEvent, touchEvent);
      } else {
        invokeNullableMethod(onGestureHandlerEvent, touchEvent);
      }
    }
  }

  //
  // Events Sending
  //

  public sendEvent = (newState: State, oldState: State): void => {
    const {
      onGestureHandlerEvent,
      onGestureHandlerStateChange,
      onGestureHandlerAnimatedEvent,
    }: PropsRef = this.propsRef!.current;
    const resultEvent: ResultEvent =
      this.actionType !== ActionType.NATIVE_DETECTOR
        ? this.transformEventData(newState, oldState)
        : this.lastSentState !== newState
          ? this.transformStateChangeEvent(newState, oldState)
          : this.transformUpdateEvent(newState);

    // In the v2 API oldState field has to be undefined, unless we send event state changed
    // Here the order is flipped to avoid workarounds such as making backup of the state and setting it to undefined first, then changing it back
    // Flipping order with setting oldState to undefined solves issue, when events were being sent twice instead of once
    // However, this may cause trouble in the future (but for now we don't know that)

    if (this.lastSentState !== newState) {
      this.lastSentState = newState;
      invokeNullableMethod(onGestureHandlerStateChange, resultEvent);
    }
    if (this.state === State.ACTIVE) {
      if (this.actionType !== ActionType.NATIVE_DETECTOR) {
        (resultEvent.nativeEvent as GestureHandlerNativeEvent).oldState =
          undefined;
      }
      if (onGestureHandlerAnimatedEvent && this.dispatchesAnimatedEvents) {
        invokeNullableMethod(onGestureHandlerAnimatedEvent, resultEvent);
      }
      invokeNullableMethod(onGestureHandlerEvent, resultEvent);
    }
  };

  private transformEventData(
    newState: State,
    oldState: State
  ): ResultEvent<GestureHandlerNativeEvent> {
    this.ensureViewRef(this.viewRef);
    return {
      nativeEvent: {
        numberOfPointers: this.tracker.trackedPointersCount,
        state: newState,
        ...this.transformNativeEvent(),
        handlerTag: this.handlerTag,
        oldState: newState !== oldState ? oldState : undefined,
        pointerType: this.pointerType,
      },
      timeStamp: Date.now(),
    };
  }

  protected transformStateChangeEvent(
    newState: State,
    oldState: State
  ): ResultEvent<GestureStateChangeEventWithData<unknown>> {
    this.ensureViewRef(this.viewRef);
    return {
      nativeEvent: {
        state: newState,
        handlerTag: this.handlerTag,
        oldState: oldState,
        handlerData: {
          numberOfPointers: this.tracker.trackedPointersCount,
          pointerType: this.pointerType,
          ...this.transformNativeEvent(),
        },
      },
      timeStamp: Date.now(),
    };
  }

  private transformUpdateEvent(
    newState: State
  ): ResultEvent<GestureUpdateEventWithData<unknown>> {
    this.ensureViewRef(this.viewRef);
    return {
      nativeEvent: {
        state: newState,
        handlerTag: this.handlerTag,
        handlerData: {
          pointerType: this.pointerType,
          numberOfPointers: this.tracker.trackedPointersCount,
          ...this.transformNativeEvent(),
        },
      },
      timeStamp: Date.now(),
    };
  }

  private transformTouchEvent(
    event: AdaptedEvent
  ): ResultEvent<GestureTouchEvent> | undefined {
    const rect = this.delegate.measureView();

    const all: PointerData[] = [];
    const changed: PointerData[] = [];

    const trackerData = this.tracker.trackedPointers;

    // This if handles edge case where all pointers have been cancelled
    // When pointercancel is triggered, reset method is called. This means that tracker will be reset after first pointer being cancelled
    // The problem is, that handler will receive another pointercancel event from the rest of the pointers
    // To avoid crashing, we don't send event if tracker tracks no pointers, i.e. has been reset
    if (trackerData.size === 0 || !trackerData.has(event.pointerId)) {
      return;
    }

    trackerData.forEach((element: TrackerElement, key: number): void => {
      const id: number = this.tracker.getMappedTouchEventId(key);

      all.push({
        id: id,
        x: element.abosoluteCoords.x - rect.pageX,
        y: element.abosoluteCoords.y - rect.pageY,
        absoluteX: element.abosoluteCoords.x,
        absoluteY: element.abosoluteCoords.y,
      });
    });

    // Each pointer sends its own event, so we want changed touches to contain only the pointer that has changed.
    // However, if the event is cancel, we want to cancel all pointers to avoid crashes
    if (event.eventType !== EventTypes.CANCEL) {
      changed.push({
        id: this.tracker.getMappedTouchEventId(event.pointerId),
        x: event.x - rect.pageX,
        y: event.y - rect.pageY,
        absoluteX: event.x,
        absoluteY: event.y,
      });
    } else {
      trackerData.forEach((element: TrackerElement, key: number): void => {
        const id: number = this.tracker.getMappedTouchEventId(key);

        changed.push({
          id: id,
          x: element.abosoluteCoords.x - rect.pageX,
          y: element.abosoluteCoords.y - rect.pageY,
          absoluteX: element.abosoluteCoords.x,
          absoluteY: element.abosoluteCoords.y,
        });
      });
    }

    let eventType: TouchEventType = TouchEventType.UNDETERMINED;

    switch (event.eventType) {
      case EventTypes.DOWN:
      case EventTypes.ADDITIONAL_POINTER_DOWN:
        eventType = TouchEventType.TOUCHES_DOWN;
        break;
      case EventTypes.UP:
      case EventTypes.ADDITIONAL_POINTER_UP:
        eventType = TouchEventType.TOUCHES_UP;
        break;
      case EventTypes.MOVE:
        eventType = TouchEventType.TOUCHES_MOVE;
        break;
      case EventTypes.CANCEL:
        eventType = TouchEventType.TOUCHES_CANCELLED;
        break;
    }

    // Here, when we receive up event, we want to decrease number of touches
    // That's because we want handler to send information that there's one pointer less
    // However, we still want this pointer to be present in allTouches array, so that its data can be accessed
    let numberOfTouches: number = all.length;

    if (
      event.eventType === EventTypes.UP ||
      event.eventType === EventTypes.ADDITIONAL_POINTER_UP
    ) {
      --numberOfTouches;
    }

    return {
      nativeEvent: {
        handlerTag: this.handlerTag,
        state: this.state,
        eventType: eventType,
        changedTouches: changed,
        allTouches: all,
        numberOfTouches: numberOfTouches,
        pointerType: this.pointerType,
      },
      timeStamp: Date.now(),
    };
  }

  private cancelTouches(): void {
    this.ensurePropsRef();
    const rect = this.delegate.measureView();

    const all: PointerData[] = [];
    const changed: PointerData[] = [];

    const trackerData = this.tracker.trackedPointers;

    if (trackerData.size === 0) {
      return;
    }

    trackerData.forEach((element: TrackerElement, key: number): void => {
      const id: number = this.tracker.getMappedTouchEventId(key);

      all.push({
        id: id,
        x: element.abosoluteCoords.x - rect.pageX,
        y: element.abosoluteCoords.y - rect.pageY,
        absoluteX: element.abosoluteCoords.x,
        absoluteY: element.abosoluteCoords.y,
      });

      changed.push({
        id: id,
        x: element.abosoluteCoords.x - rect.pageX,
        y: element.abosoluteCoords.y - rect.pageY,
        absoluteX: element.abosoluteCoords.x,
        absoluteY: element.abosoluteCoords.y,
      });
    });

    const cancelEvent: ResultEvent<GestureTouchEvent> = {
      nativeEvent: {
        handlerTag: this.handlerTag,
        state: this.state,
        eventType: TouchEventType.TOUCHES_CANCELLED,
        changedTouches: changed,
        allTouches: all,
        numberOfTouches: all.length,
        pointerType: this.pointerType,
      },
      timeStamp: Date.now(),
    };

    const { onGestureHandlerEvent }: PropsRef = this.propsRef!.current;

    invokeNullableMethod(onGestureHandlerEvent, cancelEvent);
  }

  private ensurePropsRef(): void {
    if (!this.propsRef) {
      throw new Error(
        tagMessage('Cannot handle event when component props are null')
      );
    }
  }

  private ensureViewRef(viewRef: any): asserts viewRef is number {
    if (!viewRef) {
      throw new Error(tagMessage('Cannot handle event when target is null'));
    }
  }

  protected transformNativeEvent(): Record<string, unknown> {
    // Those properties are shared by most handlers and if not this method will be overriden
    const lastCoords = this.tracker.getAbsoluteCoordsAverage();
    const lastRelativeCoords = this.tracker.getRelativeCoordsAverage();

    return {
      x: lastRelativeCoords.x,
      y: lastRelativeCoords.y,
      absoluteX: lastCoords.x,
      absoluteY: lastCoords.y,
    };
  }

  //
  // Handling config
  //

  public setGestureConfig(config: Config) {
    this.resetConfig();
    this.updateGestureConfig(config);
  }

  public updateGestureConfig(config: Config): void {
    if (config.enabled !== undefined && this.enabled !== config.enabled) {
      this._enabled = config.enabled;
      this.delegate.onEnabledChange();
    }

    if (config.hitSlop !== undefined) {
      this.hitSlop = config.hitSlop;
      this.hitSlop = config.hitSlop;
      this.validateHitSlops();
    }

    if (config.dispatchesAnimatedEvents !== undefined) {
      this.dispatchesAnimatedEvents = config.dispatchesAnimatedEvents;
    }

    if (config.manualActivation !== undefined) {
      this.manualActivation = config.manualActivation;
    }

    if (config.mouseButton !== undefined) {
      this.mouseButton = config.mouseButton;
    }

    if (config.needsPointerData !== undefined) {
      this.needsPointerData = config.needsPointerData;
    }

    if (config.shouldCancelWhenOutside !== undefined) {
      this.shouldCancelWhenOutside = config.shouldCancelWhenOutside;
    }

    if (config.enableContextMenu !== undefined) {
      this.enableContextMenu = config.enableContextMenu;
    }

    if (config.activeCursor !== undefined) {
      this._activeCursor = config.activeCursor;
    }

    if (config.touchAction !== undefined) {
      this._touchAction = config.touchAction;
    }

    if (config.userSelect !== undefined) {
      this._userSelect = config.userSelect;
    }

    if (this.enabled) {
      return;
    }

    switch (this.state) {
      case State.ACTIVE:
        this.fail(true);
        break;
      case State.UNDETERMINED:
        GestureHandlerOrchestrator.instance.removeHandlerFromOrchestrator(this);
        break;
      default:
        this.cancel(true);
        break;
    }
  }

  private validateHitSlops(): void {
    if (!this.hitSlop) {
      return;
    }

    if (
      this.hitSlop.left !== undefined &&
      this.hitSlop.right !== undefined &&
      this.hitSlop.width !== undefined
    ) {
      throw new Error(
        'HitSlop Error: Cannot define left, right and width at the same time'
      );
    }

    if (
      this.hitSlop.width !== undefined &&
      this.hitSlop.left === undefined &&
      this.hitSlop.right === undefined
    ) {
      throw new Error(
        'HitSlop Error: When width is defined, either left or right has to be defined'
      );
    }

    if (
      this.hitSlop.height !== undefined &&
      this.hitSlop.top !== undefined &&
      this.hitSlop.bottom !== undefined
    ) {
      throw new Error(
        'HitSlop Error: Cannot define top, bottom and height at the same time'
      );
    }

    if (
      this.hitSlop.height !== undefined &&
      this.hitSlop.top === undefined &&
      this.hitSlop.bottom === undefined
    ) {
      throw new Error(
        'HitSlop Error: When height is defined, either top or bottom has to be defined'
      );
    }
  }

  private checkHitSlop(): boolean {
    if (!this.hitSlop) {
      return true;
    }

    const { width, height } = this.delegate.measureView();

    let left = 0;
    let top = 0;
    let right: number = width;
    let bottom: number = height;

    if (this.hitSlop.horizontal !== undefined) {
      left -= this.hitSlop.horizontal;
      right += this.hitSlop.horizontal;
    }

    if (this.hitSlop.vertical !== undefined) {
      top -= this.hitSlop.vertical;
      bottom += this.hitSlop.vertical;
    }

    if (this.hitSlop.left !== undefined) {
      left = -this.hitSlop.left;
    }

    if (this.hitSlop.right !== undefined) {
      right = width + this.hitSlop.right;
    }

    if (this.hitSlop.top !== undefined) {
      top = -this.hitSlop.top;
    }

    if (this.hitSlop.bottom !== undefined) {
      bottom = height + this.hitSlop.bottom;
    }

    if (this.hitSlop.width !== undefined) {
      if (this.hitSlop.left !== undefined) {
        right = left + this.hitSlop.width;
      } else if (this.hitSlop.right !== undefined) {
        left = right - this.hitSlop.width;
      }
    }

    if (this.hitSlop.height !== undefined) {
      if (this.hitSlop.top !== undefined) {
        bottom = top + this.hitSlop.height;
      } else if (this.hitSlop.bottom !== undefined) {
        top = bottom - this.hitSlop.height;
      }
    }

    const rect = this.delegate.measureView();

    const lastCoords = this.tracker.getLastAbsoluteCoords();

    if (!lastCoords) {
      return false;
    }

    const offsetX: number = lastCoords.x - rect.pageX;
    const offsetY: number = lastCoords.y - rect.pageY;

    return (
      offsetX >= left && offsetX <= right && offsetY >= top && offsetY <= bottom
    );
  }

  public isButtonInConfig(mouseButton: MouseButton | undefined) {
    return (
      !mouseButton ||
      (!this.mouseButton && mouseButton === MouseButton.LEFT) ||
      (this.mouseButton && mouseButton & this.mouseButton)
    );
  }

  protected resetConfig(): void {
    this._enabled = true;
    this.manualActivation = false;
    this.shouldCancelWhenOutside = false;
    this.mouseButton = undefined;
    this.hitSlop = undefined;
    this.needsPointerData = false;
    this.dispatchesAnimatedEvents = false;
    this.enableContextMenu = false;
    this._activeCursor = undefined;
    this._touchAction = undefined;
    this._userSelect = undefined;
  }

  public onDestroy(): void {
    GestureHandlerOrchestrator.instance.removeHandlerFromOrchestrator(this);
    this.delegate.destroy();
  }

  //
  // Getters and setters
  //

  public get handlerTag() {
    return this._handlerTag;
  }
  public set handlerTag(value: number) {
    this._handlerTag = value;
  }

  public get delegate() {
    return this._delegate;
  }

  public get tracker() {
    return this._tracker;
  }

  public get state(): State {
    return this._state;
  }
  protected set state(value: State) {
    this._state = value;
  }

  public get shouldCancelWhenOutside() {
    return this._shouldCancelWhenOutside;
  }
  protected set shouldCancelWhenOutside(value) {
    this._shouldCancelWhenOutside = value;
  }

  public get enabled() {
    return this._enabled;
  }

  public get pointerType(): PointerType {
    return this._pointerType;
  }

  public get active() {
    return this._active;
  }
  protected set active(value) {
    this._active = value;
  }

  public get awaiting() {
    return this._awaiting;
  }
  protected set awaiting(value) {
    this._awaiting = value;
  }

  public get activationIndex() {
    return this._activationIndex;
  }
  protected set activationIndex(value) {
    this._activationIndex = value;
  }

  public get shouldResetProgress() {
    return this._shouldResetProgress;
  }
  protected set shouldResetProgress(value) {
    this._shouldResetProgress = value;
  }

  public get enableContextMenu() {
    return this._enableContextMenu;
  }
  protected set enableContextMenu(value) {
    this._enableContextMenu = value;
  }

  public get activeCursor() {
    return this._activeCursor;
  }

  public get touchAction() {
    return this._touchAction;
  }

  public get userSelect() {
    return this._userSelect;
  }

  public getTrackedPointersID(): number[] {
    return this.tracker.trackedPointersIDs;
  }

  private isFinished(): boolean {
    return (
      this.state === State.END ||
      this.state === State.FAILED ||
      this.state === State.CANCELLED
    );
  }
}

function invokeNullableMethod(
  method:
    | ((event: ResultEvent) => void)
    | { __getHandler: () => (event: ResultEvent) => void }
    | { __nodeConfig: { argMapping: unknown[] } },
  event: ResultEvent
): void {
  if (!method) {
    return;
  }

  if (typeof method === 'function') {
    method(event);
    return;
  }

  if ('__getHandler' in method && typeof method.__getHandler === 'function') {
    const handler = method.__getHandler();
    invokeNullableMethod(handler, event);
    return;
  }

  if (!('__nodeConfig' in method)) {
    return;
  }

  const { argMapping }: { argMapping: unknown } = method.__nodeConfig;
  if (!Array.isArray(argMapping)) {
    return;
  }

  for (const [index, [key, value]] of argMapping.entries()) {
    if (!(key in event.nativeEvent)) {
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nativeValue = (event.nativeEvent as any)[key];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (value?.setValue) {
      // Reanimated API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      value.setValue(nativeValue);
    } else {
      // RN Animated API
      method.__nodeConfig.argMapping[index] = [key, nativeValue];
    }
  }

  return;
}
