interface StepDefinition {
  signal: string;
  callbacks: (() => void)[];
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

  public sendSignal(signal: string) {
    if (!this.enabled) {
      return;
    }

    const step = this.steps[this.stepIndex];

    if (step.signal !== signal) {
      this.enabled = false;
      return;
    }

    step.callbacks.forEach((cb) => cb());
    this.stepIndex++;
  }
}

class StateMachine {
  private flows: Flow[];

  constructor() {
    this.flows = [];
  }

  public reset() {
    for (const flow of this.flows) {
      flow.reset();
    }
  }

  public sendSignal(signal: string) {
    this.flows.forEach((flow) => flow.sendSignal(signal));
  }

  public loadFlowDefinitions(flowDefinitions: FlowDefinition[]) {
    for (const flow of flowDefinitions) {
      if (flow.isActive === false) {
        continue;
      }
      this.flows.push(new Flow(flow));
    }
    return;
  }
}

export { StateMachine, FlowDefinition };
