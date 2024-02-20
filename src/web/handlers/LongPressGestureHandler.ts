import { State } from '../../State';
import { AdaptedEvent, Config } from '../interfaces';

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
    if (this.config.enableContextMenu === undefined) {
      this.config.enableContextMenu = false;
    }

    super.init(ref, propsRef);
  }

  protected transformNativeEvent() {
    return {
      ...super.transformNativeEvent(),
      duration: Date.now() - this.startTime,
    };
  }

  public updateGestureConfig({ enabled = true, ...props }: Config): void {
    super.updateGestureConfig({ enabled: enabled, ...props });

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
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.tryBegin(event);
    this.tryActivate();
    this.checkDistanceFail(event);
  }

  protected onPointerMove(event: AdaptedEvent): void {
    super.onPointerMove(event);
    this.tracker.track(event);
    this.checkDistanceFail(event);
  }

  protected onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);

    if (this.currentState === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  private tryBegin(event: AdaptedEvent): void {
    if (this.currentState !== State.UNDETERMINED) {
      return;
    }

    this.previousTime = Date.now();
    this.startTime = this.previousTime;

    this.begin();

    this.startX = event.x;
    this.startY = event.y;
  }

  private tryActivate(): void {
    if (this.minDurationMs > 0) {
      this.activationTimeout = setTimeout(() => {
        this.activate();
      }, this.minDurationMs);
    } else if (this.minDurationMs === 0) {
      this.activate();
    }
  }

  private checkDistanceFail(event: AdaptedEvent): void {
    const dx = event.x - this.startX;
    const dy = event.y - this.startY;
    const distSq = dx * dx + dy * dy;

    if (distSq <= this.maxDistSq) {
      return;
    }

    if (this.currentState === State.ACTIVE) {
      this.cancel();
    } else {
      this.fail();
    }
  }
}
