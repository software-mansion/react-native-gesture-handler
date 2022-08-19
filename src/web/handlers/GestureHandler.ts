/* eslint-disable @typescript-eslint/no-empty-function */
import { findNodeHandle } from 'react-native';
import { State } from '../../State';
import {
  Config,
  AdaptedPointerEvent,
  PropsRef,
  ResultEvent,
} from '../interfaces';
import EventManager from '../tools/EventManager';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import InteractionManager from '../tools/InteractionManager';
import PointerTracker from '../tools/PointerTracker';

export default abstract class GestureHandler {
  private lastSentState: State | null = null;
  protected currentState: State = State.UNDETERMINED;

  protected shouldCancellWhenOutside = false;
  protected hasCustomActivationCriteria: boolean;
  protected enabled = false;

  private ref!: number;
  private propsRef!: React.RefObject<unknown>;
  protected config: Config = { enabled: false };
  private handlerTag!: number;
  protected view: HTMLElement | null = null;

  protected eventManager!: EventManager;
  protected tracker: PointerTracker = new PointerTracker();
  protected interactionManager!: InteractionManager;

  // Orchestrator properties
  protected activationIndex = 0;
  protected awaiting = false;
  protected active = false;
  protected shouldResetProgress = false;

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
    this.setEventManager();
  }

  private setView(ref: number) {
    if (!ref) {
      this.view = null;
      return;
    }

    this.view = (findNodeHandle(ref) as unknown) as HTMLElement;
    this.view.style['touchAction'] = 'none';
    this.view.style['webkitUserSelect'] = 'none';
    this.view.style['userSelect'] = 'none';

    //@ts-ignore This one disables default events on Safari
    this.view.style['WebkitTouchCallout'] = 'none';
  }

  private setEventManager(): void {
    if (!this.view) {
      return;
    }

    this.eventManager = new EventManager(this.view);

    this.eventManager.setOnPointerDown(this.onPointerDown.bind(this));
    this.eventManager.setOnPointerUp(this.onPointerUp.bind(this));
    this.eventManager.setOnPointerMove(this.onPointerMove.bind(this));
    this.eventManager.setOnPointerEnter(this.onPointerEnter.bind(this));
    this.eventManager.setOnPointerOut(this.onPointerOut.bind(this));
    this.eventManager.setOnPointerCancel(this.onPointerCancel.bind(this));
    this.eventManager.setOnPointerOutOfBounds(
      this.onPointerOutOfBounds.bind(this)
    );

    this.eventManager.setListeners();
  }

  public setInteractionManager(manager: InteractionManager): void {
    this.interactionManager = manager;
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
    this.currentState = State.UNDETERMINED;
  }

  //
  // State logic
  //

  public moveToState(newState: State, event: AdaptedPointerEvent) {
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

  public begin(event: AdaptedPointerEvent): void {
    if (!this.checkHitSlop(event)) {
      return;
    }

    if (this.currentState === State.UNDETERMINED) {
      this.moveToState(State.BEGAN, event);
    }
  }

  public fail(event: AdaptedPointerEvent): void {
    if (
      this.currentState === State.ACTIVE ||
      this.currentState === State.BEGAN
    ) {
      this.moveToState(State.FAILED, event);
    }

    this.resetProgress();
  }

  public cancel(event: AdaptedPointerEvent): void {
    if (
      this.currentState === State.ACTIVE ||
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.onCancel();
      this.moveToState(State.CANCELLED, event);
    }
  }

  protected activate(event: AdaptedPointerEvent, _force = false) {
    if (
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.moveToState(State.ACTIVE, event);
    }
  }

  public end(event: AdaptedPointerEvent) {
    if (
      this.currentState === State.BEGAN ||
      this.currentState === State.ACTIVE
    ) {
      this.moveToState(State.END, event);
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

    return this.interactionManager.shouldWaitForHandlerFailure(this, handler);
  }

  public shouldRequireToWaitForFailure(handler: GestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return this.interactionManager.shouldRequireHandlerToWaitForFailure(
      this,
      handler
    );
  }

  public shouldRecognizeSimultaneously(handler: GestureHandler): boolean {
    if (handler === this) {
      return true;
    }

    return this.interactionManager.shouldRecognizeSimultaneously(this, handler);
  }

  public shouldBeCancelledByOther(handler: GestureHandler): boolean {
    if (handler === this) {
      return false;
    }

    return this.interactionManager.shouldHandlerBeCancelledBy(this, handler);
  }

  //
  // Event actions
  //

  protected onPointerDown(_event: AdaptedPointerEvent): void {
    GestureHandlerOrchestrator.getInstance().recordHandlerIfNotPresent(this);
  }
  // Adding another pointer to existing ones
  protected onPointerAdd(_event: AdaptedPointerEvent): void {}
  protected onPointerUp(_event: AdaptedPointerEvent): void {}
  // Removing pointer, when there is more than one pointers
  protected onPointerRemove(_event: AdaptedPointerEvent): void {}
  protected onPointerMove(event: AdaptedPointerEvent): void {
    this.tryToSendMoveEvent(event, false);
  }
  protected onPointerOut(_event: AdaptedPointerEvent): void {}
  protected onPointerEnter(_event: AdaptedPointerEvent): void {}
  protected onPointerCancel(_event: AdaptedPointerEvent): void {}
  protected onPointerOutOfBounds(event: AdaptedPointerEvent): void {
    this.tryToSendMoveEvent(event, true);
  }
  private tryToSendMoveEvent(event: AdaptedPointerEvent, out: boolean): void {
    if (
      this.currentState === State.ACTIVE &&
      (!out || (out && !this.shouldCancellWhenOutside))
    ) {
      this.sendEvent(event, this.currentState, this.currentState);
    }
  }

  //
  // Events Sending
  //

  public sendEvent = (
    event: AdaptedPointerEvent,
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
    event: AdaptedPointerEvent,
    newState: State,
    oldState: State
  ): ResultEvent {
    return {
      nativeEvent: {
        numberOfPointers: this.tracker.getTrackedPointersCount(),
        state: newState,
        pointerInside: this.eventManager?.isPointerInBounds({
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

  protected transformNativeEvent(_event: AdaptedPointerEvent) {
    return {};
  }

  //
  // Handling config
  //

  public updateGestureConfig({ enabled = true, ...props }): void {
    this.config = { enabled, ...props };
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

  private checkHitSlop(event: AdaptedPointerEvent): boolean {
    if (!this.config.hitSlop || !this.view) {
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

  public getView(): HTMLElement | null {
    return this.view;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
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

  protected setShouldCancelWhenOutside(flag: boolean) {
    this.shouldCancellWhenOutside = flag;
  }
  protected getShouldCancelWhenOutside(): boolean {
    return this.shouldCancellWhenOutside;
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
