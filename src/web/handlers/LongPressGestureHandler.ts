import { State } from '../../State';
import { AdaptedEvent } from '../interfaces';

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

  public init(ref: number, propsRef: React.RefObject<unknown>) {
    super.init(ref, propsRef);
    this.setShouldCancelWhenOutside(true);
  }

  protected transformNativeEvent(event: AdaptedEvent) {
    return {
      x: event.offsetX,
      y: event.offsetY,
      absoluteX: event.x,
      absoluteY: event.y,
      duration: Date.now() - this.startTime,
    };
  }

  public updateGestureConfig({ enabled = true, ...props }): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

    this.enabled = enabled;

    if (this.config.minDurationMs !== undefined) {
      this.minDurationMs = this.config.minDurationMs;
    }

    if (this.config.maxDist !== undefined) {
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

  protected onPointerDown(event: AdaptedEvent): void {
    super.onPointerDown(event);
    this.tryBegin(event);
    this.tryActivate(event);
    this.shouldFail(event);
  }

  protected onPointerAdd(event: AdaptedEvent): void {
    this.onPointerDown(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);

    if (this.currentState === State.ACTIVE) {
      this.end(event);
    } else {
      this.fail(event);
    }
  }

  protected onPointerRemove(event: AdaptedEvent): void {
    this.onPointerUp(event);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    this.shouldFail(event);
  }

  private tryBegin(event: AdaptedEvent): void {
    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.previousTime = Date.now();
    this.startTime = this.previousTime;

    this.begin(event);

    this.startX = event.x;
    this.startY = event.y;
  }

  private tryActivate(event: AdaptedEvent): void {
    if (this.minDurationMs > 0) {
      this.activationTimeout = setTimeout(() => {
        this.activate(event);
      }, this.minDurationMs);
    } else if (this.minDurationMs === 0) {
      this.activate(event);
    }
  }

  private shouldFail(event: AdaptedEvent): void {
    const dx = event.x - this.startX;
    const dy = event.y - this.startY;
    const distSq = dx * dx + dy * dy;

    if (distSq > this.maxDistSq) {
      if (this.currentState === State.ACTIVE) {
        this.cancel(event);
      } else {
        this.fail(event);
      }
    }
  }
}
