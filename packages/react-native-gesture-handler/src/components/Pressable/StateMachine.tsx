import { PressableEvent } from './PressableProps';

interface StepDefinition {
  signal: string;
  callback?: (event: PressableEvent) => void;
}

class StateMachine {
  private steps: StepDefinition[];
  private currentStepIndex: number;
  private eventPayload: PressableEvent | null;

  constructor(steps: StepDefinition[]) {
    this.steps = steps;
    this.currentStepIndex = 0;
    this.eventPayload = null;
  }

  public reset() {
    this.currentStepIndex = 0;
    this.eventPayload = null;
  }

  public sendEvent(eventName: string, eventPayload?: PressableEvent) {
    const step = this.steps[this.currentStepIndex];
    this.eventPayload = eventPayload || this.eventPayload;

    if (step.signal !== eventName) {
      if (this.currentStepIndex > 0) {
        // retry with position at index 0
        this.reset();
        this.sendEvent(eventName, eventPayload);
      }
      return;
    }

    this.eventPayload && step.callback?.(this.eventPayload);
    this.currentStepIndex++;

    if (this.currentStepIndex === this.steps.length) {
      this.reset();
    }
  }
}

export { StateMachine };
