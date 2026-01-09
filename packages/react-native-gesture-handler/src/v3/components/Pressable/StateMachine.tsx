import { PressableEvent } from './PressableProps';

export interface StateDefinition {
  eventName: string;
  callback?: (event: PressableEvent) => void;
}

class PressableStateMachine {
  private states: StateDefinition[] | null;
  private currentStepIndex: number;
  private eventPayload: PressableEvent | null;

  constructor() {
    this.states = null;
    this.currentStepIndex = 0;
    this.eventPayload = null;
  }

  public setStates(states: StateDefinition[]) {
    this.states = states;
  }

  public reset() {
    this.currentStepIndex = 0;
    this.eventPayload = null;
  }

  public handleEvent(eventName: string, eventPayload?: PressableEvent) {
    if (!this.states) {
      return;
    }
    const step = this.states[this.currentStepIndex];
    this.eventPayload = eventPayload || this.eventPayload;

    if (step.eventName !== eventName) {
      if (this.currentStepIndex > 0) {
        // retry with position at index 0
        this.reset();
        this.handleEvent(eventName, eventPayload);
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
