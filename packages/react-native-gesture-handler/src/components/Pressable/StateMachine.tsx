interface StepDefinition {
  signal: string;
  callbacks?: (() => void)[];
}

interface FlowDefinition {
  isActive: boolean;
  steps: StepDefinition[];
}

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
      // this case should never occur
      return true;
    }

    const step = this.steps[this.stepIndex];

    if (step.signal !== signal) {
      this.enabled = false;
      return false;
    }

    step.callbacks?.forEach((cb) => cb());
    this.stepIndex++;

    return this.stepIndex === this.steps.length;
  }
}

class StateMachine {
  private flows: Flow[];

  constructor(flowDefinitions: FlowDefinition[]) {
    this.flows = [];
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
