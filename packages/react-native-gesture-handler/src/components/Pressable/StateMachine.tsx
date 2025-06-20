import { PressableEvent } from './PressableProps';

interface StepDefinition {
  signal: string;
  callbacks?: ((event: PressableEvent) => void)[];
}

interface FlowDefinition {
  isActive: boolean;
  steps: StepDefinition[];
}

const RNGH_ISSUE_URL =
  'https://github.com/software-mansion/react-native-gesture-handler/issues/new?template=bug-report.yml';

const OVERFLOW_ERROR_MESSAGE = `Pressable StateMachine: Index overflow error. Please report this bug: ${RNGH_ISSUE_URL}`;
const UNDEFINED_EVENT_ERROR_MESSAGE = `Pressable StateMachine: Tried calling CB with undefined event argument!. Please report this bug: ${RNGH_ISSUE_URL}`;

class Flow {
  private steps: StepDefinition[];
  private stepIndex: number;
  private enabled: boolean;

  constructor(definition: FlowDefinition) {
    this.steps = definition.steps;
    this.stepIndex = 0;
    this.enabled = true;
  }

  public reset() {
    this.stepIndex = 0;
    this.enabled = true;
  }

  public sendSignal(signal: string, event?: PressableEvent): boolean {
    if (!this.enabled) {
      return false;
    }

    if (this.stepIndex >= this.steps.length) {
      // this case should not be possible
      console.error(OVERFLOW_ERROR_MESSAGE);
      return true;
    }

    const step = this.steps[this.stepIndex];

    if (step.signal !== signal) {
      this.enabled = false;
      return false;
    }

    if (step.callbacks && step.callbacks.length > 0 && !event) {
      // if this case occurs, it's an unexpected edge-case that has to be patched
      console.warn(UNDEFINED_EVENT_ERROR_MESSAGE);
    }

    step.callbacks?.forEach((cb) => event && cb(event));
    this.stepIndex++;

    if (this.stepIndex === this.steps.length) {
      /* dbg */ console.log('Pressable StateMachine: Success!');
    }

    return this.stepIndex === this.steps.length;
  }
}

class StateMachine {
  private flows: Flow[];
  private latestEvent: PressableEvent | undefined;
  /* dbg, remove */ private label: string | undefined;

  constructor(flowDefinitions: FlowDefinition[], label?: string) {
    this.flows = [];
    this.label = label;
    for (const flow of flowDefinitions) {
      if (flow.isActive === false) {
        continue;
      }
      this.flows.push(new Flow(flow));
    }
  }

  public reset() {
    for (const flow of this.flows) {
      flow.reset();
    }
    this.latestEvent = undefined;
  }

  public setEvent(event: PressableEvent) {
    this.latestEvent = event;
  }

  public sendSignal(signal: string) {
    /* dbg */ console.log(`${this.label ?? 'Received'}:`, signal);

    let isComplete = false;

    for (const flow of this.flows) {
      isComplete ||= flow.sendSignal(signal, this.latestEvent);
    }

    if (isComplete) {
      this.reset();
    }
  }
}

export { StateMachine, FlowDefinition };
