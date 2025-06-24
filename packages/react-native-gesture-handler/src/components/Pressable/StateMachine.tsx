import { PressableEvent } from './PressableProps';

interface StepDefinition {
  signal: string;
  callback?: (event: PressableEvent) => void;
}

const RNGH_ISSUE_URL =
  'https://github.com/software-mansion/react-native-gesture-handler/issues/new?template=bug-report.yml';

const GH_TAG = '[GESTURE HANDLER] Pressable StateMachine:';

const UNDEFINED_EVENT_ERROR_MESSAGE = `${GH_TAG} Tried calling CB with undefined event argument! Please report this bug: ${RNGH_ISSUE_URL}`;

class StateMachine {
  private steps: StepDefinition[];
  private stepIndex: number;
  private latestEvent: PressableEvent | undefined;
  /* dbg */ private label: string;

  constructor(steps: StepDefinition[], label: string) {
    this.steps = steps;
    this.stepIndex = 0;
    this.latestEvent = undefined;
    /* dbg */ this.label = label;
  }

  public reset() {
    this.stepIndex = 0;
    this.latestEvent = undefined;
  }

  public sendSignal(signal: string, event?: PressableEvent) {
    /* dbg */ console.log(`${this.label ?? 'Received'}:`, signal);

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

    if (step.callback && !this.latestEvent) {
      // This case indicates an unexpected edge-case that has to be patched
      console.warn(UNDEFINED_EVENT_ERROR_MESSAGE);
    }

    this.latestEvent && step.callback?.(this.latestEvent);
    this.stepIndex++;

    if (this.stepIndex === this.steps.length) {
      this.reset();
    }
  }
}

export { StateMachine };
