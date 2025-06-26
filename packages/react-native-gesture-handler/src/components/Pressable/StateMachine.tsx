import { PressableEvent } from './PressableProps';

interface StateDefinition {
  eventName: string;
  callback?: (event: PressableEvent) => void;
}

class PressableStateMachine {
  private states: StateDefinition[];
  private currentStepIndex: number;
  private eventPayload: PressableEvent | null;

  constructor(steps: StateDefinition[]) {
    this.states = steps;
    this.currentStepIndex = 0;
    this.eventPayload = null;
  }

  public reset() {
    this.currentStepIndex = 0;
    this.eventPayload = null;
  }

  public sendEvent(eventName: string, eventPayload?: PressableEvent) {
    const step = this.states[this.currentStepIndex];
    this.eventPayload = eventPayload || this.eventPayload;

    if (step.eventName !== eventName) {
      if (this.currentStepIndex > 0) {
        // retry with position at index 0
        this.reset();
        this.sendEvent(eventName, eventPayload);
      }
      return;
    }

    if (this.eventPayload && step.callback) {
      step.callback(this.eventPayload);
    }

    this.currentStepIndex++;

    if (this.currentStepIndex === this.states.length) {
      this.reset();
    }
  }
}

export { PressableStateMachine };
