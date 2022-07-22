import { GHEvent } from './EventManager';
import GestureHandler from './GestureHandler';

export default class TapGestureHandler extends GestureHandler {
  readonly DEFAULT_MAX_DURATION_MS = 500;
  readonly DEFAULT_MAX_DELAY_MS = 200;
  readonly DEFAULT_NUMBER_OF_TAPS = 1;
  readonly DEFAULT_MIN_NUMBER_OF_POINTERS = 1;

  private maxDeltaX = Number.MIN_SAFE_INTEGER;
  private maxDeltaY = Number.MIN_SAFE_INTEGER;
  private maxDistSq = Number.MIN_SAFE_INTEGER;
  private maxDurationMs = this.DEFAULT_MAX_DURATION_MS;
  private maxDelayMs = this.DEFAULT_MAX_DELAY_MS;

  private numberOfTaps = this.DEFAULT_NUMBER_OF_TAPS;
  private minNumberOfPointers = this.DEFAULT_MIN_NUMBER_OF_POINTERS;
  private currentMaxNumberOfPointers = 1;

  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private lastX = 0;
  private lastY = 0;

  private tapsSoFar = 0;

  constructor() {
    super();
    this.setShouldCancelWhenOutside(true);
  }

  get name(): string {
    return 'tap';
  }

  protected resetConfig(): void {
    super.resetConfig();

    this.maxDeltaX = Number.MIN_SAFE_INTEGER;
    this.maxDeltaY = Number.MIN_SAFE_INTEGER;
    this.maxDistSq = Number.MIN_SAFE_INTEGER;
    this.maxDurationMs = this.DEFAULT_MAX_DURATION_MS;
    this.maxDelayMs = this.DEFAULT_MAX_DELAY_MS;
    this.numberOfTaps = this.DEFAULT_NUMBER_OF_TAPS;
    this.minNumberOfPointers = this.DEFAULT_MIN_NUMBER_OF_POINTERS;
  }

  removePendingGestures(id: string): void {}

  setOnDownAction(event: GHEvent): void {}

  activate(event: GHEvent, force: boolean): void {
    super.activate(event, force);
    this.end(event);
  }

  onCancel(): void {
    //
  }
  onReset(): void {
    this.tapsSoFar = 0;
    this.currentMaxNumberOfPointers = 0;
  }
}
