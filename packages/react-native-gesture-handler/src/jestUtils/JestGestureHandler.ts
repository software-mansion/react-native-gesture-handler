import type { ArbitratedGestureHandler } from '../handlers/gestureArbitration/GestureArbitrationTypes';
import type GestureArbitrator from '../handlers/gestureArbitration/GestureArbitrator';
import { State } from '../State';

export type JestHandlerDataPayload = Record<string, unknown>;

export interface JestGestureEvent {
  state: State;
  oldState?: State;
  handlerTag: number;
  handlerData: JestHandlerDataPayload;
}

export type JestGestureEventSink = (event: JestGestureEvent) => void;

export interface JestGesturePayloads {
  begin: JestHandlerDataPayload;
  activate: JestHandlerDataPayload;
  updates: JestHandlerDataPayload[];
  end: JestHandlerDataPayload;
}

/**
 * Lightweight handler used by `fireGesture`. It stores handler state and
 * arbitration metadata, requests state transitions through the shared
 * arbitration core, and forwards only the transitions emitted by that core
 * to the v3 event pipeline. It does not simulate pointers, views,
 * coordinates or native recognizer configuration.
 */
export class JestGestureHandler implements ArbitratedGestureHandler {
  public state: State = State.UNDETERMINED;
  public active = false;
  public awaiting = false;
  public activationIndex = Number.MAX_SAFE_INTEGER;
  public shouldResetProgress = false;
  public readonly enabled = true;

  private lastSentState: State | null = null;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    public readonly handlerTag: number,
    private arbitrator: GestureArbitrator<JestGestureHandler>,
    private sink: JestGestureEventSink,
    private payloads: JestGesturePayloads
  ) {}

  private moveToState(newState: State) {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;

    this.arbitrator.onHandlerStateChange(this, newState, oldState);
  }

  public begin() {
    this.arbitrator.recordHandlerIfNotPresent(this);

    if (this.state === State.UNDETERMINED) {
      this.moveToState(State.BEGAN);
    }
  }

  public activate() {
    if (this.state === State.BEGAN) {
      this.moveToState(State.ACTIVE);
    }
  }

  public end() {
    if (this.state === State.BEGAN || this.state === State.ACTIVE) {
      this.moveToState(State.END);
    }
  }

  public fail() {
    if (this.state === State.ACTIVE || this.state === State.BEGAN) {
      this.moveToState(State.FAILED);
    }
  }

  public cancel() {
    if (
      this.state === State.ACTIVE ||
      this.state === State.UNDETERMINED ||
      this.state === State.BEGAN
    ) {
      this.moveToState(State.CANCELLED);
    }
  }

  public reset() {
    this.state = State.UNDETERMINED;
  }

  // Called by the arbitration core with observable transitions only.
  public sendEvent(newState: State, oldState: State) {
    if (this.lastSentState === newState) {
      return;
    }

    this.lastSentState = newState;

    this.sink({
      state: newState,
      oldState,
      handlerTag: this.handlerTag,
      handlerData: this.payloadForState(newState),
    });
  }

  /**
   * Update events are not state transitions — they are forwarded only while
   * the arbitration core considers this handler observably active.
   */
  public dispatchUpdates() {
    for (const update of this.payloads.updates) {
      if (!this.active || this.lastSentState !== State.ACTIVE) {
        return;
      }

      this.sink({
        state: State.ACTIVE,
        handlerTag: this.handlerTag,
        handlerData: update,
      });
    }
  }

  private payloadForState(state: State): JestHandlerDataPayload {
    switch (state) {
      case State.BEGAN:
      case State.FAILED:
        // A failed gesture was never activated, so it reports the begin
        // payload.
        return this.payloads.begin;
      case State.ACTIVE:
        return this.payloads.activate;
      default:
        return this.payloads.end;
    }
  }
}
