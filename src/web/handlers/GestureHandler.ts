/* eslint-disable @typescript-eslint/no-empty-function */
import { State } from '../../State';
import {
  Config,
  AdaptedEvent,
  PropsRef,
  ResultEvent,
  PointerData,
  ResultTouchEvent,
  PointerType,
  TouchEventType,
  EventTypes,
} from '../interfaces';
import EventManager from '../tools/EventManager';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import InteractionManager from '../tools/InteractionManager';
import PointerTracker, { TrackerElement } from '../tools/PointerTracker';
import { GestureHandlerDelegate } from '../tools/GestureHandlerDelegate';

export default abstract class GestureHandler {
  private lastSentState: State | null = null;
  protected currentState: State = State.UNDETERMINED;

  protected shouldCancellWhenOutside = false;
  protected hasCustomActivationCriteria = false;
  protected enabled = false;

  private viewRef!: number;
  private propsRef!: React.RefObject<unknown>;
  private handlerTag!: number;
  protected config: Config = { enabled: false };

  protected tracker: PointerTracker = new PointerTracker();

  // Orchestrator properties
  protected activationIndex = 0;
  protected awaiting = false;
  protected active = false;
  protected shouldResetProgress = false;
  protected pointerType: PointerType = PointerType.NONE;

  protected delegate: GestureHandlerDelegate<unknown>;

  public constructor(delegate: GestureHandlerDelegate<unknown>) {
    this.delegate = delegate;
  }

  //
  // Initializing handler
  //

  protected init(viewRef: number, propsRef: React.RefObject<unknown>) {
    this.propsRef = propsRef;
    this.viewRef = viewRef;

    this.currentState = State.UNDETERMINED;

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
    manager.setListeners();
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
    this.currentState = State.UNDETERMINED;
  }

  //
  // State logic
  //

  public moveToState(newState: State, sendIfDisabled?: boolean) {
    if (this.currentState === newState) {
      return;
    }

    const oldState = this.currentState;
    this.currentState = newState;

    if (
      this.tracker.getTrackedPointersCount() > 0 &&
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
  }

  protected onStateChange(_newState: State, _oldState: State): void {}

  public begin(): void {
    if (!this.checkHitSlop()) {
      return;
    }

    if (this.currentState === State.UNDETERMINED) {
      this.moveToState(State.BEGAN);
    }
  }

  /**
   * @param {boolean} sendIfDisabled - Used when handler becomes disabled. With this flag orchestrator will be forced to send fail event
   */
  public fail(sendIfDisabled?: boolean): void {
    if (
      this.currentState === State.ACTIVE ||
      this.currentState === State.BEGAN
    ) {
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
      this.currentState === State.ACTIVE ||
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.onCancel();

      // Same as above - order matters
      this.delegate.onCancel();

      this.moveToState(State.CANCELLED, sendIfDisabled);
    }
  }

  public activate(_force = false) {
    if (
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.delegate.onActivate();

      this.moveToState(State.ACTIVE);
    }
  }

  public end() {
    if (
      this.currentState === State.BEGAN ||
      this.currentState === State.ACTIVE
    ) {
      // Same as above - order matters
      this.delegate.onEnd();

      this.moveToState(State.END);
    }

    this.resetProgress();
  }

  //
  // Methods for orchestrator
  //

  public isAwaiting(): boolean {
    return this.awaiting;
  }
  public setAwaiting(value: boolean): void {
    this.awaiting = value;
  }

  public isActive(): boolean {
    return this.active;
  }
  public setActive(value: boolean): void {
    this.active = value;
  }

  public getShouldResetProgress(): boolean {
    return this.shouldResetProgress;
  }
  public setShouldResetProgress(value: boolean): void {
    this.shouldResetProgress = value;
  }

  public getActivationIndex(): number {
    return this.activationIndex;
  }
  public setActivationIndex(value: number): void {
    this.activationIndex = value;
  }

  public shouldWaitForHandlerFailure(handler: GestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.getInstance().shouldWaitForHandlerFailure(
      this,
      handler
    );
  }

  public shouldRequireToWaitForFailure(handler: GestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.getInstance().shouldRequireHandlerToWaitForFailure(
      this,
      handler
    );
  }

  public shouldRecognizeSimultaneously(handler: GestureHandler): boolean {
    if (handler === this) {
      return true;
    }

    return InteractionManager.getInstance().shouldRecognizeSimultaneously(
      this,
      handler
    );
  }

  public shouldBeCancelledByOther(handler: GestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return InteractionManager.getInstance().shouldHandlerBeCancelledBy(
      this,
      handler
    );
  }

  //
  // Event actions
  //

  protected onPointerDown(event: AdaptedEvent): void {
    GestureHandlerOrchestrator.getInstance().recordHandlerIfNotPresent(this);
    this.pointerType = event.pointerType;

    if (this.pointerType === PointerType.TOUCH) {
      GestureHandlerOrchestrator.getInstance().cancelMouseAndPenGestures(this);
    }

    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  // Adding another pointer to existing ones
  protected onPointerAdd(event: AdaptedEvent): void {
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerUp(event: AdaptedEvent): void {
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  // Removing pointer, when there is more than one pointers
  protected onPointerRemove(event: AdaptedEvent): void {
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerMove(event: AdaptedEvent): void {
    this.tryToSendMoveEvent(false);
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerLeave(event: AdaptedEvent): void {
    if (this.shouldCancellWhenOutside) {
      switch (this.currentState) {
        case State.ACTIVE:
          this.cancel();
          break;
        case State.BEGAN:
          this.fail();
          break;
      }
      return;
    }

    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerEnter(event: AdaptedEvent): void {
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerCancel(event: AdaptedEvent): void {
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }

    this.cancel();
    this.reset();
  }
  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.tryToSendMoveEvent(true);
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerMoveOver(_event: AdaptedEvent): void {
    // used only by hover gesture handler atm
  }
  protected onPointerMoveOut(_event: AdaptedEvent): void {
    // used only by hover gesture handler atm
  }
  private tryToSendMoveEvent(out: boolean): void {
    if (
      this.enabled &&
      this.active &&
      (!out || (out && !this.shouldCancellWhenOutside))
    ) {
      this.sendEvent(this.currentState, this.currentState);
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
    if (this.currentState === State.ACTIVE) {
      resultEvent.nativeEvent.oldState = undefined;
      invokeNullableMethod(onGestureHandlerEvent, resultEvent);
    }
  };

  private transformEventData(newState: State, oldState: State): ResultEvent {
    return {
      nativeEvent: {
        numberOfPointers: this.tracker.getTrackedPointersCount(),
        state: newState,
        pointerInside: this.delegate.isPointerInBounds({
          x: this.tracker.getLastAvgX(),
          y: this.tracker.getLastAvgY(),
        }),
        ...this.transformNativeEvent(),
        handlerTag: this.handlerTag,
        target: this.viewRef,
        oldState: newState !== oldState ? oldState : undefined,
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

    const trackerData = this.tracker.getData();

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
        x: element.lastX - rect.pageX,
        y: element.lastY - rect.pageY,
        absoluteX: element.lastX,
        absoluteY: element.lastY,
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
          x: element.lastX - rect.pageX,
          y: element.lastY - rect.pageY,
          absoluteX: element.lastX,
          absoluteY: element.lastY,
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
        state: this.currentState,
        eventType: event.touchEventType ?? eventType,
        changedTouches: changed,
        allTouches: all,
        numberOfTouches: numberOfTouches,
      },
      timeStamp: Date.now(),
    };
  }

  private cancelTouches(): void {
    const rect = this.delegate.measureView();

    const all: PointerData[] = [];
    const changed: PointerData[] = [];

    const trackerData = this.tracker.getData();

    if (trackerData.size === 0) {
      return;
    }

    trackerData.forEach((element: TrackerElement, key: number): void => {
      const id: number = this.tracker.getMappedTouchEventId(key);

      all.push({
        id: id,
        x: element.lastX - rect.pageX,
        y: element.lastY - rect.pageY,
        absoluteX: element.lastX,
        absoluteY: element.lastY,
      });

      changed.push({
        id: id,
        x: element.lastX - rect.pageX,
        y: element.lastY - rect.pageY,
        absoluteX: element.lastX,
        absoluteY: element.lastY,
      });
    });

    const cancelEvent: ResultTouchEvent = {
      nativeEvent: {
        handlerTag: this.handlerTag,
        state: this.currentState,
        eventType: TouchEventType.CANCELLED,
        changedTouches: changed,
        allTouches: all,
        numberOfTouches: all.length,
      },
      timeStamp: Date.now(),
    };

    const { onGestureHandlerEvent }: PropsRef = this.propsRef
      .current as PropsRef;

    invokeNullableMethod(onGestureHandlerEvent, cancelEvent);
  }

  protected transformNativeEvent(): Record<string, unknown> {
    // those properties are shared by most handlers and if not this method will be overriden
    const rect = this.delegate.measureView();

    return {
      x: this.tracker.getLastAvgX() - rect.pageX,
      y: this.tracker.getLastAvgY() - rect.pageY,
      absoluteX: this.tracker.getLastAvgX(),
      absoluteY: this.tracker.getLastAvgY(),
    };
  }

  //
  // Handling config
  //

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    this.config = { enabled: enabled, ...props };
    this.enabled = enabled;

    if (this.config.shouldCancelWhenOutside !== undefined) {
      this.setShouldCancelWhenOutside(this.config.shouldCancelWhenOutside);
    }

    this.validateHitSlops();

    if (this.enabled) {
      return;
    }

    switch (this.currentState) {
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
    const offsetX: number = this.tracker.getLastX() - rect.pageX;
    const offsetY: number = this.tracker.getLastY() - rect.pageY;

    if (
      offsetX >= left &&
      offsetX <= right &&
      offsetY >= top &&
      offsetY <= bottom
    ) {
      return true;
    }
    return false;
  }

  protected resetConfig(): void {}

  //
  // Getters and setters
  //

  public getTag(): number {
    return this.handlerTag;
  }

  public setTag(tag: number): void {
    this.handlerTag = tag;
  }

  public getConfig() {
    return this.config;
  }

  public getDelegate(): GestureHandlerDelegate<unknown> {
    return this.delegate;
  }

  public getTracker(): PointerTracker {
    return this.tracker;
  }

  public getTrackedPointersID(): number[] {
    return this.tracker.getTrackedPointersID();
  }

  public getState(): State {
    return this.currentState;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private isFinished(): boolean {
    return (
      this.currentState === State.END ||
      this.currentState === State.FAILED ||
      this.currentState === State.CANCELLED
    );
  }

  protected setShouldCancelWhenOutside(shouldCancel: boolean) {
    this.shouldCancellWhenOutside = shouldCancel;
  }

  protected getShouldCancelWhenOutside(): boolean {
    return this.shouldCancellWhenOutside;
  }

  public getPointerType(): PointerType {
    return this.pointerType;
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

  const { argMapping } = method.__nodeConfig;
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
      //Reanimated API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      value.setValue(nativeValue);
    } else {
      //RN Animated API
      method.__nodeConfig.argMapping[index] = [key, nativeValue];
    }
  }

  return;
}
