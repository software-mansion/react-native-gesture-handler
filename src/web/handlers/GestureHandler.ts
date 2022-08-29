/* eslint-disable @typescript-eslint/no-empty-function */
import { findNodeHandle } from 'react-native';
import { State } from '../../State';
import {
  Config,
  AdaptedEvent,
  PropsRef,
  ResultEvent,
  PointerData,
  ResultTouchEvent,
} from '../interfaces';
import EventManager from '../tools/EventManager';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import InteractionManager from '../tools/InteractionManager';
import PointerEventManager from '../tools/PointerEventManager';
import PointerTracker from '../tools/PointerTracker';
import TouchEventManager from '../tools/TouchEventManager';

export default abstract class GestureHandler {
  private lastSentState: State | null = null;
  protected currentState: State = State.UNDETERMINED;

  protected shouldCancellWhenOutside = false;
  protected hasCustomActivationCriteria: boolean;
  protected enabled = false;

  private ref!: number;
  private propsRef!: React.RefObject<unknown>;
  private handlerTag!: number;
  protected config: Config = { enabled: false };
  protected view!: HTMLElement;

  protected eventManagers: EventManager[] = [];
  protected tracker: PointerTracker = new PointerTracker();

  // Orchestrator properties
  protected activationIndex = 0;
  protected awaiting = false;
  protected active = false;
  protected shouldResetProgress = false;
  protected pointerType: string | null = null;

  public constructor() {
    this.hasCustomActivationCriteria = false;
  }

  //
  // Initializing handler
  //

  protected init(ref: number, propsRef: React.RefObject<unknown>) {
    this.propsRef = propsRef;
    this.ref = ref;

    this.currentState = State.UNDETERMINED;

    this.setView(ref);
    this.setEventManager(new PointerEventManager(this.view));
    this.setEventManager(new TouchEventManager(this.view));
  }

  private setView(ref: number) {
    if (!ref) {
      throw new Error(
        `Cannot find HTML Element for handler ${this.handlerTag}`
      );
    }

    this.view = (findNodeHandle(ref) as unknown) as HTMLElement;
    this.view.style['touchAction'] = 'none';
    this.view.style['webkitUserSelect'] = 'none';
    this.view.style['userSelect'] = 'none';

    //@ts-ignore This one disables default events on Safari
    this.view.style['WebkitTouchCallout'] = 'none';
  }

  private setEventManager(manager: EventManager): void {
    manager.setOnPointerDown(this.onPointerDown.bind(this));
    manager.setOnPointerAdd(this.onPointerAdd.bind(this));
    manager.setOnPointerUp(this.onPointerUp.bind(this));
    manager.setOnPointerRemove(this.onPointerRemove.bind(this));
    manager.setOnPointerMove(this.onPointerMove.bind(this));
    manager.setOnPointerEnter(this.onPointerEnter.bind(this));
    manager.setOnPointerOut(this.onPointerOut.bind(this));
    manager.setOnPointerCancel(this.onPointerCancel.bind(this));
    manager.setOnPointerOutOfBounds(this.onPointerOutOfBounds.bind(this));
    manager.setListeners();

    this.eventManagers.push(manager);
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
    this.eventManagers.forEach((manager: EventManager) =>
      manager.resetManager()
    );
    this.currentState = State.UNDETERMINED;
  }

  //
  // State logic
  //

  public moveToState(newState: State, event: AdaptedEvent) {
    if (this.currentState === newState) {
      return;
    }

    const oldState = this.currentState;
    this.currentState = newState;

    GestureHandlerOrchestrator.getInstance().onHandlerStateChange(
      this,
      newState,
      oldState,
      event
    );

    this.onStateChange(newState, oldState);
  }

  protected onStateChange(_newState: State, _oldState: State): void {}

  public begin(event: AdaptedEvent): void {
    if (!this.checkHitSlop(event)) {
      return;
    }

    if (this.currentState === State.UNDETERMINED) {
      this.moveToState(State.BEGAN, event);
    }
  }

  public fail(event: AdaptedEvent): void {
    if (
      this.currentState === State.ACTIVE ||
      this.currentState === State.BEGAN
    ) {
      this.moveToState(State.FAILED, event);
      this.view.style.cursor = 'auto';
    }

    this.resetProgress();
  }

  public cancel(event: AdaptedEvent): void {
    if (
      this.currentState === State.ACTIVE ||
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.onCancel();
      this.moveToState(State.CANCELLED, event);
      this.view.style.cursor = 'auto';
    }
  }

  public activate(event: AdaptedEvent, _force = false) {
    if (
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.moveToState(State.ACTIVE, event);
      this.view.style.cursor = 'grab';
    }
  }

  public end(event: AdaptedEvent) {
    if (
      this.currentState === State.BEGAN ||
      this.currentState === State.ACTIVE
    ) {
      this.moveToState(State.END, event);
      this.view.style.cursor = 'auto';
    }
    // this.currentState = State.UNDETERMINED;

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

    if (this.pointerType === 'touch') {
      GestureHandlerOrchestrator.getInstance().cancelMouseAndPenGestures(
        event,
        this
      );
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
    this.tryToSendMoveEvent(event, false);
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  protected onPointerOut(event: AdaptedEvent): void {
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
  }
  protected onPointerOutOfBounds(event: AdaptedEvent): void {
    this.tryToSendMoveEvent(event, true);
    if (this.config.needsPointerData) {
      this.sendTouchEvent(event);
    }
  }
  private tryToSendMoveEvent(event: AdaptedEvent, out: boolean): void {
    if (this.active && (!out || (out && !this.shouldCancellWhenOutside))) {
      this.sendEvent(event, this.currentState, this.currentState);
    }
  }

  public sendTouchEvent(event: AdaptedEvent): void {
    const { onGestureHandlerEvent }: PropsRef = this.propsRef
      .current as PropsRef;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const touchEvent: ResultTouchEvent = this.transformTouchEvent(event)!;

    if (touchEvent) {
      invokeNullableMethod(onGestureHandlerEvent, touchEvent);
    }
  }

  //
  // Events Sending
  //

  public sendEvent = (
    event: AdaptedEvent,
    newState: State,
    oldState: State
  ): void => {
    const {
      onGestureHandlerEvent,
      onGestureHandlerStateChange,
    }: PropsRef = this.propsRef.current as PropsRef;

    const resultEvent: ResultEvent = this.transformEventData(
      event,
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

  private transformEventData(
    event: AdaptedEvent,
    newState: State,
    oldState: State
  ): ResultEvent {
    return {
      nativeEvent: {
        numberOfPointers: this.tracker.getTrackedPointersCount(),
        state: newState,
        pointerInside: this.isPointerInBounds({
          x: event.x,
          y: event.y,
        }),
        ...this.transformNativeEvent(event),
        handlerTag: this.handlerTag,
        target: this.ref,
        oldState: newState !== oldState ? oldState : undefined,
      },
      timeStamp: Date.now(),
    };
  }

  private transformTouchEvent(
    event: AdaptedEvent
  ): ResultTouchEvent | undefined {
    if (!event.allTouches || !event.changedTouches || !event.touchEventType) {
      return;
    }

    const rect = this.view.getBoundingClientRect();

    const all: PointerData[] = [];
    const changed: PointerData[] = [];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < event.allTouches.length; ++i) {
      const id: number = this.tracker.getMappedTouchEventId(
        event.allTouches[i].identifier
      );

      if (isNaN(id)) return;

      all.push({
        id: id,
        x: event.allTouches[i].clientX - rect.left,
        y: event.allTouches[i].clientY - rect.top,
        absoluteX: event.allTouches[i].clientX,
        absoluteY: event.allTouches[i].clientY,
      });
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < event.changedTouches.length; ++i) {
      const id: number = this.tracker.getMappedTouchEventId(
        event.changedTouches[i].identifier
      );

      if (isNaN(id)) return;

      changed.push({
        id: id, //event.changedTouches[i].identifier,
        x: event.changedTouches[i].clientX - rect.left,
        y: event.changedTouches[i].clientY - rect.top,
        absoluteX: event.changedTouches[i].clientX,
        absoluteY: event.changedTouches[i].clientY,
      });
    }

    return {
      nativeEvent: {
        handlerTag: this.handlerTag,
        state: this.currentState,
        eventType: event.touchEventType,
        changedTouches: changed,
        allTouches: all,
        numberOfTouches: all.length,
      },
      timeStamp: Date.now(),
    };
  }

  protected transformNativeEvent(_event: AdaptedEvent) {
    return {};
  }

  //
  // Handling config
  //

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    this.config = { enabled: enabled, ...props };
    this.validateHitSlops();
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

  private checkHitSlop(event: AdaptedEvent): boolean {
    if (!this.config.hitSlop) {
      return true;
    }

    const width = this.view.getBoundingClientRect().width;
    const height = this.view.getBoundingClientRect().height;

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

    if (
      event.offsetX >= left &&
      event.offsetX <= right &&
      event.offsetY >= top &&
      event.offsetY <= bottom
    ) {
      return true;
    }
    return false;
  }

  public isPointerInBounds({ x, y }: { x: number; y: number }): boolean {
    const rect: DOMRect = this.view.getBoundingClientRect();

    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
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

  protected getConfig() {
    return this.config;
  }

  public getShouldEnableGestureOnSetup(): boolean {
    throw new Error('Must override GestureHandler.shouldEnableGestureOnSetup');
  }

  public getView(): HTMLElement {
    return this.view;
  }

  public getEventManagers(): EventManager[] {
    return this.eventManagers;
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

  protected setShouldCancelWhenOutside(shouldCancel: boolean) {
    this.shouldCancellWhenOutside = shouldCancel;
  }
  protected getShouldCancelWhenOutside(): boolean {
    return this.shouldCancellWhenOutside;
  }

  public getPointerType(): string | null {
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
