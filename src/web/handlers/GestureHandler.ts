/* eslint-disable @typescript-eslint/no-empty-function */
import { State } from '../../State';
import {
  Config,
  AdaptedEvent,
  PropsRef,
  ResultEvent,
  PointerData,
  ResultTouchEvent,
  TouchEventType,
  EventTypes,
} from '../interfaces';
import EventManager from '../tools/EventManager';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import InteractionManager from '../tools/InteractionManager';
import PointerTracker, { TrackerElement } from '../tools/PointerTracker';
import IGestureHandler from './IGestureHandler';
import { MouseButton } from '../../handlers/gestureHandlerCommon';
import { PointerType } from '../../PointerType';
import { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';

export default abstract class GestureHandler implements IGestureHandler {
  private _lastSentState: State | null = null;
  get lastSentState() {
    return this._lastSentState;
  }
  set lastSentState(val: State | null) {
    this._lastSentState = val;
  }

  private _state: State = State.UNDETERMINED;
  get state() {
    return this._state;
  }
  set state(newState: State) {
    this._state = newState;
  }

  private _shouldCancelWhenOutside = false;
  get shouldCancelWhenOutside() {
    return this._shouldCancelWhenOutside;
  }
  set shouldCancelWhenOutside(val: boolean) {
    this._shouldCancelWhenOutside = val;
  }

  private _hasCustomActivationCriteria = false;
  get hasCustomActivationCriteria() {
    return this._hasCustomActivationCriteria;
  }
  set hasCustomActivationCriteria(val: boolean) {
    this._hasCustomActivationCriteria = val;
  }

  private _enabled = false;
  get enabled() {
    return this._enabled;
  }
  set enabled(val: boolean) {
    this._enabled = val;
  }

  private _viewRef!: number;
  get viewRef() {
    return this._viewRef;
  }
  set viewRef(val: number) {
    this._viewRef = val;
  }

  private _propsRef!: React.RefObject<unknown>;
  get propsRef() {
    return this._propsRef;
  }
  set propsRef(val: React.RefObject<unknown>) {
    this._propsRef = val;
  }

  private _handlerTag!: number;
  get handlerTag() {
    return this._handlerTag;
  }
  set handlerTag(tag: number) {
    this._handlerTag = tag;
  }

  private _config: Config = { enabled: false };
  get config() {
    return this._config;
  }
  set config(newConfig: Config) {
    this._config = newConfig;
  }

  private _pointerTracker: PointerTracker = new PointerTracker();
  get pointerTracker() {
    return this._pointerTracker;
  }
  set pointerTracker(tracker: PointerTracker) {
    this._pointerTracker = tracker;
  }

  private _activationIndex = 0;
  get activationIndex() {
    return this._activationIndex;
  }
  set activationIndex(val: number) {
    this._activationIndex = val;
  }

  private _awaiting = false;
  get awaiting() {
    return this._awaiting;
  }
  set awaiting(val: boolean) {
    this._awaiting = val;
  }

  private _active = false;
  get active() {
    return this._active;
  }
  set active(val: boolean) {
    this._active = val;
  }

  private _shouldResetProgress = false;
  get shouldResetProgress() {
    return this._shouldResetProgress;
  }
  set shouldResetProgress(val: boolean) {
    this._shouldResetProgress = val;
  }

  private _pointerType: PointerType = PointerType.MOUSE;
  get pointerType() {
    return this._pointerType;
  }
  set pointerType(newPointerType: PointerType) {
    this._pointerType = newPointerType;
  }

  private _delegate: GestureHandlerDelegate<unknown, IGestureHandler>;
  get delegate() {
    return this._delegate;
  }
  set delegate(newDelegate: GestureHandlerDelegate<unknown, IGestureHandler>) {
    this._delegate = newDelegate;
  }

  public constructor(
    delegate: GestureHandlerDelegate<unknown, IGestureHandler>
  ) {
    this._delegate = delegate;
  }

  protected init(viewRef: number, propsRef: React.RefObject<unknown>) {
    this.propsRef = propsRef;
    this.viewRef = viewRef;

    this.state = State.UNDETERMINED;

    this.delegate.init(viewRef, this);
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

  protected onCancel(): void {}
  protected onReset(): void {}
  protected resetProgress(): void {}

  public reset(): void {
    this.pointerTracker.resetTracker();
    this.onReset();
    this.resetProgress();
    this.delegate.reset();
    this.state = State.UNDETERMINED;
  }

  public moveToState(newState: State, sendIfDisabled?: boolean) {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;

    if (
      this.pointerTracker.getTrackedPointersCount() > 0 &&
      this.config.needsPointerData &&
      this.isFinished()
    ) {
      this.cancelTouches();
    }

    GestureHandlerOrchestrator.getInstance().onHandlerStateChange(
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
      // At this point we can use state as previuos state, because immediately after changing cursor we call moveToState method.
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
      (this.config.manualActivation !== true || force) &&
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

  public shouldWaitForHandlerFailure(handler: IGestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.getInstance().shouldWaitForHandlerFailure(
      this,
      handler
    );
  }

  public shouldRequireToWaitForFailure(handler: IGestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.getInstance().shouldRequireHandlerToWaitForFailure(
      this,
      handler
    );
  }

  public shouldRecognizeSimultaneously(handler: IGestureHandler): boolean {
    if (handler === this) {
      return true;
    }

    return InteractionManager.getInstance().shouldRecognizeSimultaneously(
      this,
      handler
    );
  }

  public shouldBeCancelledByOther(handler: IGestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.getInstance().shouldHandlerBeCancelledBy(
      this,
      handler
    );
  }

  protected onPointerDown(event: AdaptedEvent): void {
    GestureHandlerOrchestrator.getInstance().recordHandlerIfNotPresent(this);
    this.pointerType = event.pointerType;

    if (this.pointerType === PointerType.TOUCH) {
      GestureHandlerOrchestrator.getInstance().cancelMouseAndPenGestures(this);
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
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }

  public sendTouchEvent(event: AdaptedEvent): void {
    if (!this.enabled) {
      return;
    }

    const { onGestureHandlerEvent }: PropsRef = this.propsRef
      .current as PropsRef;

    const touchEvent: ResultTouchEvent | undefined =
      this.transformTouchEvent(event);

    if (touchEvent) {
      invokeNullableMethod(onGestureHandlerEvent, touchEvent);
    }
  }

  //
  // Events Sending
  //

  public sendEvent = (newState: State, oldState: State): void => {
    const { onGestureHandlerEvent, onGestureHandlerStateChange }: PropsRef =
      this.propsRef.current as PropsRef;

    const resultEvent: ResultEvent = this.transformEventData(
      newState,
      oldState
    );

    // In the new API oldState field has to be undefined, unless we send event state changed
    // Here the order is flipped to avoid workarounds such as making backup of the state and setting it to undefined first, then changing it back
    // Flipping order with setting oldState to undefined solves issue, when events were being sent twice instead of once
    // However, this may cause trouble in the future (but for now we don't know that)

    if (this.lastSentState !== newState) {
      this.lastSentState = newState;
      invokeNullableMethod(onGestureHandlerStateChange, resultEvent);
    }
    if (this.state === State.ACTIVE) {
      resultEvent.nativeEvent.oldState = undefined;
      invokeNullableMethod(onGestureHandlerEvent, resultEvent);
    }
  };

  private transformEventData(newState: State, oldState: State): ResultEvent {
    return {
      nativeEvent: {
        numberOfPointers: this.pointerTracker.getTrackedPointersCount(),
        state: newState,
        pointerInside: this.delegate.isPointerInBounds(
          this.pointerTracker.getAbsoluteCoordsAverage()
        ),
        ...this.transformNativeEvent(),
        handlerTag: this.handlerTag,
        target: this.viewRef,
        oldState: newState !== oldState ? oldState : undefined,
        pointerType: this.pointerType,
      },
      timeStamp: Date.now(),
    };
  }

  private transformTouchEvent(
    event: AdaptedEvent
  ): ResultTouchEvent | undefined {
    const rect = this.delegate.measureView();

    const all: PointerData[] = [];
    const changed: PointerData[] = [];

    const trackerData = this.pointerTracker.getData();

    // This if handles edge case where all pointers have been cancelled
    // When pointercancel is triggered, reset method is called. This means that tracker will be reset after first pointer being cancelled
    // The problem is, that handler will receive another pointercancel event from the rest of the pointers
    // To avoid crashing, we don't send event if tracker tracks no pointers, i.e. has been reset
    if (trackerData.size === 0 || !trackerData.has(event.pointerId)) {
      return;
    }

    trackerData.forEach((element: TrackerElement, key: number): void => {
      const id: number = this.pointerTracker.getMappedTouchEventId(key);

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
        id: this.pointerTracker.getMappedTouchEventId(event.pointerId),
        x: event.x - rect.pageX,
        y: event.y - rect.pageY,
        absoluteX: event.x,
        absoluteY: event.y,
      });
    } else {
      trackerData.forEach((element: TrackerElement, key: number): void => {
        const id: number = this.pointerTracker.getMappedTouchEventId(key);

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
        eventType = TouchEventType.DOWN;
        break;
      case EventTypes.UP:
      case EventTypes.ADDITIONAL_POINTER_UP:
        eventType = TouchEventType.UP;
        break;
      case EventTypes.MOVE:
        eventType = TouchEventType.MOVE;
        break;
      case EventTypes.CANCEL:
        eventType = TouchEventType.CANCELLED;
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
    const rect = this.delegate.measureView();

    const all: PointerData[] = [];
    const changed: PointerData[] = [];

    const trackerData = this.pointerTracker.getData();

    if (trackerData.size === 0) {
      return;
    }

    trackerData.forEach((element: TrackerElement, key: number): void => {
      const id: number = this.pointerTracker.getMappedTouchEventId(key);

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

    const cancelEvent: ResultTouchEvent = {
      nativeEvent: {
        handlerTag: this.handlerTag,
        state: this.state,
        eventType: TouchEventType.CANCELLED,
        changedTouches: changed,
        allTouches: all,
        numberOfTouches: all.length,
        pointerType: this.pointerType,
      },
      timeStamp: Date.now(),
    };

    const { onGestureHandlerEvent }: PropsRef = this.propsRef
      .current as PropsRef;

    invokeNullableMethod(onGestureHandlerEvent, cancelEvent);
  }

  protected transformNativeEvent(): Record<string, unknown> {
    // Those properties are shared by most handlers and if not this method will be overriden
    const lastCoords = this.pointerTracker.getAbsoluteCoordsAverage();
    const lastRelativeCoords = this.pointerTracker.getRelativeCoordsAverage();

    return {
      x: lastRelativeCoords.x,
      y: lastRelativeCoords.y,
      absoluteX: lastCoords.x,
      absoluteY: lastCoords.y,
    };
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    this.config = { enabled: enabled, ...props };
    this.enabled = enabled;

    this.delegate.onEnabledChange(enabled);

    if (this.config.shouldCancelWhenOutside !== undefined) {
      this.shouldCancelWhenOutside = this.config.shouldCancelWhenOutside;
    }

    this.validateHitSlops();

    if (this.enabled) {
      return;
    }

    switch (this.state) {
      case State.ACTIVE:
        this.fail(true);
        break;
      case State.UNDETERMINED:
        GestureHandlerOrchestrator.getInstance().removeHandlerFromOrchestrator(
          this
        );
        break;
      default:
        this.cancel(true);
        break;
    }
  }

  protected checkCustomActivationCriteria(criterias: string[]): void {
    for (const key in this.config) {
      if (criterias.indexOf(key) >= 0) {
        this.hasCustomActivationCriteria = true;
      }
    }
  }

  private validateHitSlops(): void {
    if (!this.config.hitSlop) {
      return;
    }

    if (
      this.config.hitSlop.left !== undefined &&
      this.config.hitSlop.right !== undefined &&
      this.config.hitSlop.width !== undefined
    ) {
      throw new Error(
        'HitSlop Error: Cannot define left, right and width at the same time'
      );
    }

    if (
      this.config.hitSlop.width !== undefined &&
      this.config.hitSlop.left === undefined &&
      this.config.hitSlop.right === undefined
    ) {
      throw new Error(
        'HitSlop Error: When width is defined, either left or right has to be defined'
      );
    }

    if (
      this.config.hitSlop.height !== undefined &&
      this.config.hitSlop.top !== undefined &&
      this.config.hitSlop.bottom !== undefined
    ) {
      throw new Error(
        'HitSlop Error: Cannot define top, bottom and height at the same time'
      );
    }

    if (
      this.config.hitSlop.height !== undefined &&
      this.config.hitSlop.top === undefined &&
      this.config.hitSlop.bottom === undefined
    ) {
      throw new Error(
        'HitSlop Error: When height is defined, either top or bottom has to be defined'
      );
    }
  }

  private checkHitSlop(): boolean {
    if (!this.config.hitSlop) {
      return true;
    }

    const { width, height } = this.delegate.measureView();

    let left = 0;
    let top = 0;
    let right: number = width;
    let bottom: number = height;

    if (this.config.hitSlop.horizontal !== undefined) {
      left -= this.config.hitSlop.horizontal;
      right += this.config.hitSlop.horizontal;
    }

    if (this.config.hitSlop.vertical !== undefined) {
      top -= this.config.hitSlop.vertical;
      bottom += this.config.hitSlop.vertical;
    }

    if (this.config.hitSlop.left !== undefined) {
      left = -this.config.hitSlop.left;
    }

    if (this.config.hitSlop.right !== undefined) {
      right = width + this.config.hitSlop.right;
    }

    if (this.config.hitSlop.top !== undefined) {
      top = -this.config.hitSlop.top;
    }

    if (this.config.hitSlop.bottom !== undefined) {
      bottom = width + this.config.hitSlop.bottom;
    }
    if (this.config.hitSlop.width !== undefined) {
      if (this.config.hitSlop.left !== undefined) {
        right = left + this.config.hitSlop.width;
      } else if (this.config.hitSlop.right !== undefined) {
        left = right - this.config.hitSlop.width;
      }
    }

    if (this.config.hitSlop.height !== undefined) {
      if (this.config.hitSlop.top !== undefined) {
        bottom = top + this.config.hitSlop.height;
      } else if (this.config.hitSlop.bottom !== undefined) {
        top = bottom - this.config.hitSlop.height;
      }
    }

    const rect = this.delegate.measureView();
    const { x, y } = this.pointerTracker.getLastAbsoluteCoords();
    const offsetX: number = x - rect.pageX;
    const offsetY: number = y - rect.pageY;

    return (
      offsetX >= left && offsetX <= right && offsetY >= top && offsetY <= bottom
    );
  }

  public isButtonInConfig(mouseButton: MouseButton | undefined) {
    return (
      !mouseButton ||
      (!this.config.mouseButton && mouseButton === MouseButton.LEFT) ||
      (this.config.mouseButton && mouseButton & this.config.mouseButton)
    );
  }

  protected resetConfig(): void {}

  public onDestroy(): void {
    this.delegate.destroy(this.config);
  }

  public getTrackedPointersID(): number[] {
    return this.pointerTracker.getTrackedPointersID();
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
    | ((event: ResultEvent | ResultTouchEvent) => void)
    | { __getHandler: () => (event: ResultEvent | ResultTouchEvent) => void }
    | { __nodeConfig: { argMapping: unknown[] } },
  event: ResultEvent | ResultTouchEvent
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
    const nativeValue = event.nativeEvent[key];

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
