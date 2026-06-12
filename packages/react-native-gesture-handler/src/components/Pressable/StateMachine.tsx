import type { PressableEvent } from './PressableProps';

export interface StateDefinition {
  eventName: string;
  callback?: (event: PressableEvent) => void;
  optional?: boolean;
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

    this.eventPayload = eventPayload || this.eventPayload;

    // Skip past optional steps that don't match the incoming event
    while (
      this.currentStepIndex < this.states.length &&
      this.states[this.currentStepIndex].eventName !== eventName &&
      this.states[this.currentStepIndex].optional
    ) {
      this.currentStepIndex++;
    }

    if (this.currentStepIndex >= this.states.length) {
      this.reset();
      return;
    }

    const step = this.states[this.currentStepIndex];
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
