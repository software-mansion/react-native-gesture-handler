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
    this.setShouldCancelWhenOutside(true);
  }

  resetProgress(): void {
    throw new Error('Method not implemented.');
  }
  onCancel(): void {
    throw new Error('Method not implemented.');
  }
  onReset(): void {
    throw new Error('Method not implemented.');
  }
}
