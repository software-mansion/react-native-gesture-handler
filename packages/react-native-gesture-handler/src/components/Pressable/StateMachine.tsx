import { PressableEvent } from './PressableProps';

interface StepDefinition {
  signal: string;
  callback?: (event: PressableEvent) => void;
}

class StateMachine {
  private steps: StepDefinition[];
  private stepIndex: number;
  private latestEvent?: PressableEvent;

  constructor(steps: StepDefinition[]) {
    this.steps = steps;
    this.stepIndex = 0;
  }

  public reset() {
    this.stepIndex = 0;
    this.latestEvent = undefined;
  }

  public sendSignal(signal: string, event?: PressableEvent) {
    const step = this.steps[this.stepIndex];
    this.latestEvent ||= event;

    if (step.signal !== signal) {
      if (this.stepIndex > 0) {
        // retry with position at index 0
        this.reset();
        this.sendSignal(signal, event);
      }
      return;
    }

    this.latestEvent && step.callback?.(this.latestEvent);
    this.stepIndex++;

    if (this.stepIndex === this.steps.length) {
      this.reset();
    }
  }
}

export { StateMachine };
