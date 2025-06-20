interface StepDefinition {
  signal: string;
  callbacks?: (() => void)[];
}

interface FlowDefinition {
  isActive: boolean;
  steps: StepDefinition[];
}

const RNGH_ISSUE_URL =
  'https://github.com/software-mansion/react-native-gesture-handler/issues/new?template=bug-report.yml';

const OVERFLOW_ERROR_MESSAGE = `Pressable StateMachine: Index overflow error. Please this bug: ${RNGH_ISSUE_URL}`;

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

  public sendSignal(signal: string): boolean {
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

    step.callbacks?.forEach((cb) => cb());
    this.stepIndex++;

    if (this.stepIndex === this.steps.length) {
      /* dbg */ console.log('Pressable StateMachine: Success!');
    }

    return this.stepIndex === this.steps.length;
  }
}

class StateMachine {
  private flows: Flow[];
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
  }

  public sendSignal(signal: string) {
    /* dbg */ console.log(`${this.label ?? 'Received'}:`, signal);

    let isComplete = false;

    for (const flow of this.flows) {
      isComplete ||= flow.sendSignal(signal);
    }

    if (isComplete) {
      this.reset();
    }
  }
}

export { StateMachine, FlowDefinition };
