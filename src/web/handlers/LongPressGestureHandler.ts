import { State } from '../../State';
import { GHEvent } from '../tools/EventManager';
import GestureHandler from './GestureHandler';

const DEFAULT_MIN_DURATION_MS = 500;
const DEFAULT_MAX_DIST_DP = 10;
const SCALING_FACTOR = 10;

export default class LongPressGestureHandler extends GestureHandler {
  private minDurationMs = DEFAULT_MIN_DURATION_MS;
  private defaultMaxDistSq = DEFAULT_MAX_DIST_DP * SCALING_FACTOR;

  private maxDistSq = this.defaultMaxDistSq;
  private startX = 0;
  private startY = 0;

  private startTime = 0;
  private previousTime = 0;

  private activationTimeout: number | undefined;

  get name(): string {
    return 'long';
  }

  public init(ref: number, propsRef: any) {
    super.init(ref, propsRef);
    this.setShouldCancelWhenOutside(true);
  }

  protected transformNativeEvent(_event: GHEvent): any {
    return {
      duration: Date.now() - this.startTime,
    };
  }

  public updateGestureConfig({ ...props }): void {
    super.updateGestureConfig({ enabled: true, ...props });

    for (const key in this.config) {
      if (
        !isNaN(this.config[key]) &&
        this.config[key] !== undefined &&
        this.config[key] !== null
      ) {
        this.hasCustomActivationCriteria = true;
      }
    }

    this.enabled = this.config.enabled as boolean;

    if (this.config.minDurationMs || this.config.maxDurationMs === 0) {
      this.minDurationMs = this.config.minDurationMs as number;
    }

    if (this.config.maxDist || this.config.minDist === 0) {
      this.maxDistSq = this.config.maxDist * this.config.maxDist;
    }
  }

  protected resetConfig(): void {
    super.resetConfig();
    this.minDurationMs = DEFAULT_MIN_DURATION_MS;
    this.maxDistSq = this.defaultMaxDistSq;
  }

  protected onStateChange(_newState: State, _oldState: State): void {
    clearTimeout(this.activationTimeout);
  }

  protected onUpAction(event: GHEvent): void {
    super.onUpAction(event);

    if (this.getState() === State.ACTIVE) this.end(event);
    else this.fail(event);
  }

  protected onDownAction(event: GHEvent): void {
    super.onDownAction(event);
    this.checkUndetermined(event);
    this.commonAction(event);
  }

  protected onMoveAction(event: GHEvent): void {
    this.commonAction(event);
  }

  private checkUndetermined(event: GHEvent): void {
    if (this.getState() !== State.UNDETERMINED) return;

    this.previousTime = Date.now();
    this.startTime = this.previousTime;

    this.begin(event);

    this.startX = event.x;
    this.startY = event.y;

    if (this.minDurationMs > 0) {
      this.activationTimeout = setTimeout(() => {
        this.activate(event);
      }, this.minDurationMs);
    } else if (this.minDurationMs === 0) {
      this.activate(event);
    }
  }

  private commonAction(event: GHEvent): void {
    const dx = event.x - this.startX;
    const dy = event.y - this.startY;
    const distSq = dx * dx + dy * dy;

    if (distSq > this.maxDistSq) {
      if (this.getState() === State.ACTIVE) this.cancel(event);
      else this.fail(event);
    }
  }

  //

  protected onCancel(): void {
    // throw new Error('Method not implemented.');
  }
  protected onReset(): void {
    // throw new Error('Method not implemented.');
  }
}
