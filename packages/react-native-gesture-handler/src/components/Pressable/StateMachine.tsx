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

const GH_TAG = '[GESTURE HANDLER] Pressable StateMachine:';

const UNDEFINED_EVENT_ERROR_MESSAGE = `${GH_TAG} Tried calling CB with undefined event argument! Please report this bug: ${RNGH_ISSUE_URL}`;

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

  public sendSignal(signal: string, event?: PressableEvent) {
    if (!this.enabled) {
      return;
    }

    const step = this.steps[this.stepIndex];

    if (step.signal !== signal) {
      this.reset();
      return;
    }

    if (step.callbacks && step.callbacks.length > 0 && !event) {
      // This case indicates an unexpected edge-case that has to be patched
      console.warn(UNDEFINED_EVENT_ERROR_MESSAGE);
    }

    step.callbacks?.forEach((cb) => event && cb(event));
    this.stepIndex++;

    if (this.stepIndex === this.steps.length) {
      this.reset();
    }
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
    /* dbg */ console.log(this.label, 'StateMachine.reset()');
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

    for (const flow of this.flows) {
      flow.sendSignal(signal, this.latestEvent);
    }
  }
}

export { StateMachine, FlowDefinition };
