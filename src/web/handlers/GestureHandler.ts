import { Dimensions, findNodeHandle } from 'react-native';
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

export default abstract class GestureHandler {
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

  protected eventManager!: EventManager;
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
    this.view.style['WebkitTouchCallout'] = 'none';
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

    this.eventManager.setListeners();
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
    this.currentState = State.UNDETERMINED;
  }

  //
  //State logic
  //

  public moveToState(newState: State, event: GHEvent) {
    if (this.currentState === newState) return;

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

  protected onStateChange(_newState: State, _oldState: State): void {
    //
  }

  public begin(event: GHEvent): void {
    if (!this.checkHitSlopTest(event)) return;

    if (this.currentState === State.UNDETERMINED)
      this.moveToState(State.BEGAN, event);
  }

  public fail(event: GHEvent): void {
    if (this.currentState !== State.ACTIVE) this.resetProgress();
    if (this.currentState === State.ACTIVE || this.currentState === State.BEGAN)
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
    GestureHandlerOrchestrator.getInstance().recordHandlerIfNotPresent(this);
  }
  //Adding another pointer to existing ones
  protected onPointerAdd(_event: GHEvent): void {
    //
  }
  protected onUpAction(_event: GHEvent): void {
    //
  }
  //Removing pointer, when there is more than one pointers
  protected onPointerRemove(_event: GHEvent): void {
    //
  }
  protected onMoveAction(event: GHEvent): void {
    this.pointerMove(event, false);
  }
  protected onOutAction(_event: GHEvent): void {
    //
  }
  protected onEnterAction(_event: GHEvent): void {
    //
  }
  protected onCancelAction(_event: GHEvent): void {
    //
  }
  protected onOutOfBoundsAction(event: GHEvent): void {
    this.pointerMove(event, true);
  }
  private pointerMove(event: GHEvent, out: boolean): void {
    if (
      this.currentState === State.ACTIVE &&
      (!out || (out && !this.shouldCancellWhenOutside))
    ) {
      this.sendEvent(event, this.currentState, this.currentState);
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

    if (this.currentState === State.ACTIVE) {
      invokeNullableMethod(onGestureHandlerEvent, resultEvent);
    }
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
        oldState: newState !== oldState ? oldState : undefined,
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
    this.config = { enabled, ...props };
    this.validateHitSlops();
    this.hasCustomActivationCriteria = true;
  }

  protected hasCustomCriteria(): void {
    for (const key in this.config) {
      if (
        !isNaN(this.config[key]) &&
        this.config[key] !== undefined &&
        this.config[key] !== null
      ) {
        this.hasCustomActivationCriteria = true;
      }
    }
  }

  private validateHitSlops(): void {
    if (!this.config.hitSlop) return;

    console.log(this.config.hitSlop);

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

  private checkHitSlopTest(event: GHEvent): boolean {
    if (!this.config.hitSlop) return true;

    console.log(this.view);

    const width = this.view!.getBoundingClientRect().width;
    const height = this.view!.getBoundingClientRect().height;

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

    console.log(left, right, '|', event.offsetX);

    if (
      event.offsetX >= left &&
      event.offsetX <= right &&
      event.offsetY >= top &&
      event.offsetY <= bottom
    )
      return true;
    else return false;
  }

  protected resetConfig(): void {
    //
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

  public getView(): HTMLElement | null {
    return this.view;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
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
}

function invokeNullableMethod(
  method:
    | ((event: ResultEvent) => void)
    | { __getHandler: () => (event: ResultEvent) => void }
    | { __nodeConfig: { argMapping: ResultEvent } },
  event: ResultEvent
): void {
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
