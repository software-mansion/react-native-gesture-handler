import { PointerType } from '../PointerType';
import { State } from '../State';
import type IGestureHandler from '../web/handlers/IGestureHandler';
import GestureHandlerOrchestrator from '../web/tools/GestureHandlerOrchestrator';

interface EmittedEvent {
  newState: State;
  oldState: State;
}

// Mimics the state-transition behavior of the web `GestureHandler` base class
// (moveToState + begin/activate/end/fail/cancel guards) without any DOM,
// pointer or delegate logic. Used to characterize the arbitration behavior
// of the orchestrator so it can be extracted into a platform-neutral core.
class FakeHandler {
  public state: State = State.UNDETERMINED;
  public active = false;
  public awaiting = false;
  public activationIndex = 0;
  public shouldResetProgress = false;
  public enabled = true;
  public pointerType = PointerType.TOUCH;

  public events: EmittedEvent[] = [];
  public resetCalls = 0;

  public delegate = {
    view: this,
    isPointerInBounds: () => false,
  };
  public tracker = {
    getLastAbsoluteCoords: () => undefined,
    resetTracker: () => undefined,
  };

  private waitFor: FakeHandler[] = [];
  private simultaneousWith: FakeHandler[] = [];

  // eslint-disable-next-line no-useless-constructor
  constructor(public handlerTag: number) {}

  public asHandler(): IGestureHandler {
    return this as unknown as IGestureHandler;
  }

  public waitForFailureOf(other: FakeHandler) {
    this.waitFor.push(other);
  }

  public recognizeSimultaneouslyWith(other: FakeHandler) {
    this.simultaneousWith.push(other);
    other.simultaneousWith.push(this);
  }

  private moveToState(newState: State) {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;

    GestureHandlerOrchestrator.instance.onHandlerStateChange(
      this.asHandler(),
      newState,
      oldState
    );
  }

  public begin() {
    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(
      this.asHandler()
    );

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
    this.resetCalls++;
    this.state = State.UNDETERMINED;
  }

  public sendEvent(newState: State, oldState: State) {
    this.events.push({ newState, oldState });
  }

  public shouldWaitForHandlerFailure(other: FakeHandler) {
    return this.waitFor.includes(other);
  }

  public shouldRequireToWaitForFailure(_other: FakeHandler) {
    return false;
  }

  public shouldRecognizeSimultaneously(other: FakeHandler) {
    return other === this || this.simultaneousWith.includes(other);
  }

  public shouldBeCancelledByOther(_other: FakeHandler) {
    // Mirrors the InteractionManager default, which returns true only for
    // active native handlers.
    return false;
  }

  public shouldBeginWithRecordedHandlers(_recorded: IGestureHandler[]) {
    return true;
  }

  public getTrackedPointersID() {
    // All fake handlers share a single pointer, like handlers attached to
    // overlapping views receiving the same interaction.
    return [0];
  }
}

function flushMicrotasks() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

let createdHandlers: FakeHandler[] = [];
let nextTag = 1;

function createHandler() {
  const handler = new FakeHandler(nextTag++);
  createdHandlers.push(handler);
  return handler;
}

afterEach(async () => {
  await flushMicrotasks();
  for (const handler of createdHandlers) {
    GestureHandlerOrchestrator.instance.removeHandlerFromOrchestrator(
      handler.asHandler()
    );
  }
  createdHandlers = [];
});

describe('Orchestrator characterization: single handler', () => {
  test('progresses through begin, activation and successful end', () => {
    const handler = createHandler();

    handler.begin();
    handler.activate();
    handler.end();

    expect(handler.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.ACTIVE, oldState: State.BEGAN },
      { newState: State.END, oldState: State.ACTIVE },
    ]);
  });

  test('failure before activation emits FAILED with BEGAN as previous state', () => {
    const handler = createHandler();

    handler.begin();
    handler.fail();

    expect(handler.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.FAILED, oldState: State.BEGAN },
    ]);
  });

  test('cancellation after activation emits CANCELLED with ACTIVE as previous state', () => {
    const handler = createHandler();

    handler.begin();
    handler.activate();
    handler.cancel();

    expect(handler.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.ACTIVE, oldState: State.BEGAN },
      { newState: State.CANCELLED, oldState: State.ACTIVE },
    ]);
  });

  test('duplicate transition requests do not emit duplicate events', () => {
    const handler = createHandler();

    handler.begin();
    handler.begin();
    handler.activate();
    handler.activate();
    handler.end();
    handler.end();

    expect(handler.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.ACTIVE, oldState: State.BEGAN },
      { newState: State.END, oldState: State.ACTIVE },
    ]);
  });

  test('finished handler is reset and removed from the orchestrator', async () => {
    const handler = createHandler();

    handler.begin();
    handler.activate();
    handler.end();

    await flushMicrotasks();

    expect(handler.resetCalls).toBe(1);
    expect(handler.active).toBe(false);
    expect(
      GestureHandlerOrchestrator.instance.isHandlerRecorded(handler.asHandler())
    ).toBe(false);
  });
});

describe('Orchestrator characterization: waiting for required handlers', () => {
  test('handler awaiting a required handler does not emit activation', () => {
    const required = createHandler();
    const awaiting = createHandler();
    awaiting.waitForFailureOf(required);

    required.begin();
    awaiting.begin();
    awaiting.activate();

    expect(awaiting.awaiting).toBe(true);
    expect(awaiting.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
    ]);
  });

  test('awaiting handler activates after the required handler fails', () => {
    const required = createHandler();
    const awaiting = createHandler();
    awaiting.waitForFailureOf(required);

    required.begin();
    awaiting.begin();
    awaiting.activate();
    required.fail();

    expect(awaiting.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.ACTIVE, oldState: State.BEGAN },
    ]);
    expect(awaiting.awaiting).toBe(false);
    expect(awaiting.active).toBe(true);
  });

  test('awaiting handler is cancelled after the required handler ends successfully', () => {
    const required = createHandler();
    const awaiting = createHandler();
    awaiting.waitForFailureOf(required);
    // Required handler would be cancelled by the awaiting one otherwise,
    // as the fake handlers share a pointer.
    required.recognizeSimultaneouslyWith(awaiting);

    required.begin();
    awaiting.begin();
    awaiting.activate();

    required.activate();
    required.end();

    // The awaiting handler was never observably active, so cancellation is
    // reported relative to BEGAN.
    expect(awaiting.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.CANCELLED, oldState: State.BEGAN },
    ]);
    expect(awaiting.awaiting).toBe(false);
  });

  test('discrete handler that finished while awaiting receives synthetic cancellation', () => {
    const required = createHandler();
    const discrete = createHandler();
    discrete.waitForFailureOf(required);
    required.recognizeSimultaneouslyWith(discrete);

    required.begin();

    // Discrete handlers may end immediately after requesting activation.
    discrete.begin();
    discrete.activate();
    discrete.end();

    expect(discrete.state).toBe(State.END);
    expect(discrete.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
    ]);

    required.activate();
    required.end();

    // Synthetic BEGAN -> CANCELLED is sent even though the handler already
    // reached END internally.
    expect(discrete.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.CANCELLED, oldState: State.BEGAN },
    ]);
  });
});

describe('Orchestrator characterization: concurrent handlers', () => {
  test('simultaneous handlers are not mutually cancelled', () => {
    const first = createHandler();
    const second = createHandler();
    first.recognizeSimultaneouslyWith(second);

    first.begin();
    second.begin();
    first.activate();
    second.activate();
    first.end();
    second.end();

    expect(first.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.ACTIVE, oldState: State.BEGAN },
      { newState: State.END, oldState: State.ACTIVE },
    ]);
    expect(second.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.ACTIVE, oldState: State.BEGAN },
      { newState: State.END, oldState: State.ACTIVE },
    ]);
  });

  test('activation cancels competing handlers', () => {
    const winner = createHandler();
    const loser = createHandler();

    winner.begin();
    loser.begin();
    winner.activate();

    expect(loser.events).toEqual([
      { newState: State.BEGAN, oldState: State.UNDETERMINED },
      { newState: State.CANCELLED, oldState: State.BEGAN },
    ]);
    expect(winner.active).toBe(true);
  });
});
