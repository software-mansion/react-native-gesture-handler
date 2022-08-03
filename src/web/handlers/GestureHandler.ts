import { findNodeHandle } from 'react-native';
import { State } from '../../State';
import EventManager, { GHEvent } from '../tools/EventManager';
import GestureHandlerOrchestrator from '../tools/GestureHandlerOrchestrator';
import InteractionManager from '../tools/InteractionManager';
import NodeManager from '../tools/NodeManager';
import Tracker from '../tools/Tracker';

export interface Config extends Record<string, any> {
  enabled?: boolean;
  simultaneousHandlers?: any[] | null;
  waitFor?: any[] | null;
}

interface NativeEvent extends Record<string, any> {
  numberOfPointers: number;
  state: State;
  pointerInside: boolean | undefined;
  handlerTag: number;
  target: number;
  oldState?: State;
}

export interface ResultEvent extends Record<string, any> {
  nativeEvent: NativeEvent;
  timeStamp: number;
}

let gestureInstances = 0;

abstract class GestureHandler {
  private lastSentState: State | null = null;
  protected currentState: State = State.UNDETERMINED;

  private gestureInstance: number;
  protected shouldCancellWhenOutside = false;
  protected hasCustomActivationCriteria: boolean;
  protected enabled = false;

  private ref: any;
  private propsRef: any;
  protected config: Config = {};
  private handlerTag!: number;
  protected view: HTMLElement | null = null;

  protected eventManager: EventManager | null = null;
  protected tracker: Tracker = new Tracker();
  protected interactionManager!: InteractionManager;

  //Orchestrator properties
  protected activationIndex = 0;
  protected awaiting = false;
  protected active = false;
  protected shouldResetProgress = false;

  public constructor() {
    this.gestureInstance = gestureInstances++;
    this.hasCustomActivationCriteria = false;
  }

  //
  //Initializing handler
  //

  protected init(ref: number, propsRef: any) {
    this.setView(ref);

    this.propsRef = propsRef;
    this.ref = ref;

    this.currentState = State.UNDETERMINED;

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
    // this.view.style['WebkitTouchCallout'] = 'none';
  }

  private setEventManager(): void {
    if (!this.view) return;

    this.eventManager = new EventManager(this.view);

    this.eventManager.setOnDownAction(this.onDownAction.bind(this));
    this.eventManager.setOnUpAction(this.onUpAction.bind(this));
    this.eventManager.setOnMoveAction(this.onMoveAction.bind(this));
    this.eventManager.setOnEnterAction(this.onEnterAction.bind(this));
    this.eventManager.setOnOutAction(this.onOutAction.bind(this));
    this.eventManager.setOnCancelAction(this.onCancelAction.bind(this));
    this.eventManager.setOutOfBoundsAction(this.onOutOfBoundsAction.bind(this));
  }

  public setInteractionManager(manager: InteractionManager): void {
    this.interactionManager = manager;
  }

  //
  //Resetting handler
  //

  protected abstract onCancel(): void;
  protected abstract onReset(): void;
  protected resetProgress(): void {
    //
  }

  public reset(): void {
    this.tracker.resetTracker();
    this.onReset();
  }

  protected resetConfig(): void {
    //
  }

  //
  //State logic
  //

  public moveToState(newState: State, event: GHEvent) {
    if (this.currentState === newState) return;
    // console.log(`${this.currentState} -> ${newState}`);

    if (
      this.tracker.getTrackedPointersNumber() > 0 &&
      (newState === State.END ||
        newState === State.CANCELLED ||
        newState === State.FAILED)
    ) {
      // this.cancelPointers();
    }

    const oldState = this.currentState;
    this.currentState = newState;

    //TODO eventCoalescingKey logic

    GestureHandlerOrchestrator.getInstance().onHandlerStateChange(
      this,
      newState,
      oldState,
      event
    );

    this.onStateChange(newState, oldState);

    if (
      newState === State.END ||
      newState === State.FAILED ||
      newState === State.CANCELLED
    ) {
      this.currentState = State.UNDETERMINED;
    }
  }

  protected onStateChange(_newState: State, _oldState: State): void {
    //
  }

  public begin(event: GHEvent): void {
    if (this.currentState === State.UNDETERMINED)
      this.moveToState(State.BEGAN, event);
  }

  public fail(event: GHEvent): void {
    if (this.getState() !== State.ACTIVE) this.resetProgress();
    if (
      this.currentState === State.ACTIVE ||
      // this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    )
      this.moveToState(State.FAILED, event);
  }

  public cancel(event: GHEvent): void {
    if (
      this.currentState === State.ACTIVE ||
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.onCancel();
      this.moveToState(State.CANCELLED, event);
    }
  }

  protected activate(event: GHEvent, _force = false) {
    if (
      this.currentState === State.UNDETERMINED ||
      this.currentState === State.BEGAN
    ) {
      this.moveToState(State.ACTIVE, event);
    }
  }

  public end(event: GHEvent) {
    this.resetProgress();
    // this.tracker.resetTracker();
    if (this.currentState === State.BEGAN || this.currentState === State.ACTIVE)
      this.moveToState(State.END, event);
  }

  //
  //Methods for orchestrator
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
    if (handler === this) return false;

    return this.interactionManager.shouldWaitForHandlerFailure(this, handler);
  }

  public shouldRequireToWaitForFailure(handler: GestureHandler): boolean {
    if (handler === this) return false;

    return this.interactionManager.shouldRequireHandlerToWaitForFailure(
      this,
      handler
    );
  }

  public shouldRecognizeSimultaneously(handler: GestureHandler): boolean {
    if (handler === this) return true;

    return this.interactionManager.shouldRecognizeSimultaneously(this, handler);
  }

  public shouldBeCancelledByOther(handler: GestureHandler): boolean {
    if (handler === this) return false;

    return this.interactionManager.shouldHandlerBeCancelledBy(this, handler);
  }

  //
  //Event actions
  //

  protected onDownAction(_event: GHEvent): void {
    // console.log('Down');
  }
  //Adding another pointer to existing ones
  protected onPointerAdd(_event: GHEvent): void {
    //
  }
  protected onUpAction(_event: GHEvent): void {
    // console.log('Up');
  }
  //Removing pointer, when there is more than one pointers
  protected onPointerRemove(_event: GHEvent): void {
    //
  }
  protected onMoveAction(event: GHEvent): void {
    // console.log('Move');
    this.pointerMove(event, false);
  }
  protected onOutAction(_event: GHEvent): void {
    // console.log('Out');
  }
  protected onEnterAction(_event: GHEvent): void {
    // console.log('Enter');
  }
  protected onCancelAction(_event: GHEvent): void {
    // console.log('Cancel');
  }
  protected onOutOfBoundsAction(event: GHEvent): void {
    // console.log('Out of bounds');
    this.pointerMove(event, true);
  }
  private pointerMove(event: GHEvent, out: boolean): void {
    const state = this.getState();

    if (
      state === State.ACTIVE &&
      (!out || (out && !this.shouldCancellWhenOutside))
    ) {
      this.sendEvent(event, state, state);
    }
  }

  //
  //Events Sending
  //

  public sendEvent = (
    event: GHEvent,
    newState: State,
    oldState: State
  ): void => {
    const {
      onGestureHandlerEvent,
      onGestureHandlerStateChange,
    } = this.propsRef.current;

    const resultEvent: ResultEvent = this.transformEventData(
      event,
      newState,
      oldState
    );

    // console.error(this.lastSentState === oldState);

    invokeNullableMethod(onGestureHandlerEvent, resultEvent);
    if (this.lastSentState !== newState) {
      this.lastSentState = newState;
      invokeNullableMethod(onGestureHandlerStateChange, resultEvent);
    }
  };

  private transformEventData(
    event: GHEvent,
    newState: State,
    oldState: State
  ): ResultEvent {
    return {
      nativeEvent: {
        numberOfPointers: this.tracker.getTrackedPointersNumber(),
        state: newState,
        pointerInside: this.eventManager?.isPointerInBounds({
          x: event.x,
          y: event.y,
        }),
        ...this.transformNativeEvent(event),
        handlerTag: this.handlerTag,
        target: this.ref as number,
        oldState:
          newState !== oldState || newState === State.ACTIVE
            ? oldState
            : undefined,
      },
      timeStamp: Date.now(),
    };
  }

  protected transformNativeEvent(_event: GHEvent) {
    return {};
  }

  //
  //Handling config
  //

  public updateGestureConfig({ enabled = true, ...props }): void {
    // this.clearSelfAsPending();

    this.config = this.ensureConfig({ enabled, ...props });
    this.hasCustomActivationCriteria = true;

    // if (Array.isArray(this.config.waitFor)) {
    //   for (const gesture of this.config.waitFor) {
    //     gesture.addPendingGesture(this);
    //   }
    // }
  }

  private ensureConfig(config: Config): Required<Config> {
    const props = { ...config };

    if (config.minDist) {
      props.minDist = config.minDist;
      props.minDistSq = props.minDist * props.minDist;
    }
    if (config.minVelocity) {
      props.minVelocity = config.minVelocity;
      props.minVelocitySq = props.minVelocity * props.minVelocity;
    }
    if (config.maxDist) {
      props.maxDist = config.maxDist;
      props.maxDistSq = props.maxDist * props.maxDist;
    }
    if (config.waitFor) {
      props.waitFor = this.asArray(config.waitFor)
        .map(({ handlerTag }: { handlerTag: number }) =>
          NodeManager.getHandler(handlerTag)
        )
        .filter((v) => v);
    } else {
      props.waitFor = null;
    }
    const configProps = [
      'minPointers',
      'maxPointers',
      'minDist',
      'maxDist',
      'maxDistSq',
      'minVelocitySq',
      'minDistSq',
      'minVelocity',
      'failOffsetXStart',
      'failOffsetYStart',
      'failOffsetXEnd',
      'failOffsetYEnd',
      'activeOffsetXStart',
      'activeOffsetXEnd',
      'activeOffsetYStart',
      'activeOffsetYEnd',
    ] as const;

    configProps.forEach((prop: typeof configProps[number]) => {
      if (typeof props[prop] === 'undefined') {
        props[prop] = Number.NaN;
      }
    });
    return props as Required<Config>;
  }

  private asArray<T>(value: T | T[]) {
    return !value ? [] : Array.isArray(value) ? value : [value];
  }

  //
  //Getters and setters
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

  abstract get name(): string;

  public getShouldEnableGestureOnSetup(): boolean {
    throw new Error('Must override GestureHandler.shouldEnableGestureOnSetup');
  }

  public getId(): string {
    return `${this.name}${this.gestureInstance}`;
  }

  public getTracker(): Tracker {
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

  //Pointers history for TapGestureHandler
  public getPointersHistory(): number[] | null {
    return null;
  }
  public clearPointerHistory(): void {
    //
  }
}

function invokeNullableMethod(
  method:
    | ((event: ResultEvent) => void)
    | { __getHandler: () => (event: ResultEvent) => void }
    | { __nodeConfig: { argMapping: ResultEvent } },
  event: ResultEvent
): void {
  // console.log(event);
  if (!method) return;

  if (typeof method === 'function') {
    method(event);
    return;
  }

  if ('__getHandler' in method && typeof method.__getHandler === 'function') {
    const handler = method.__getHandler();
    invokeNullableMethod(handler, event);
    return;
  }

  if ('__nodeConfig' in method) {
    const { argMapping } = method.__nodeConfig;
    if (!Array.isArray(argMapping)) return;

    for (const [index, [key, value]] of argMapping.entries()) {
      if (!(key in event.nativeEvent)) continue;

      const nativeValue = event.nativeEvent[key];

      if (value?.setValue) {
        //Reanimated API
        value.setValue(nativeValue);
      } else {
        //RN Animated API
        method.__nodeConfig.argMapping[index] = [key, nativeValue];
      }
    }

    return;
  }
}

export default GestureHandler;
