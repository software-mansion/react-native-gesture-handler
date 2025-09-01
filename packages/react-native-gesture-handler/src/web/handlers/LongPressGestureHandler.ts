import { ActionType } from '../../ActionType';
import { State } from '../../State';
import { AdaptedEvent, Config, PropsRef } from '../interfaces';

import GestureHandler from './GestureHandler';

const DEFAULT_MIN_DURATION_MS = 500;
const DEFAULT_MAX_DIST_DP = 10;
const SCALING_FACTOR = 10;

export default class LongPressGestureHandler extends GestureHandler {
  private minDurationMs = DEFAULT_MIN_DURATION_MS;
  private defaultMaxDistSq = DEFAULT_MAX_DIST_DP * SCALING_FACTOR;

  private maxDistSq = this.defaultMaxDistSq;
  private numberOfPointers = 1;
  private startX = 0;
  private startY = 0;

  private startTime = 0;
  private previousTime = 0;

  private activationTimeout: number | undefined;

  public override init(
    ref: number,
    propsRef: React.RefObject<PropsRef>,
    actionType: ActionType,
    childTag?: number
  ) {
    if (this.enableContextMenu === undefined) {
      this.enableContextMenu = false;
    }

    super.init(ref, propsRef, actionType, childTag);
  }

  protected override transformNativeEvent() {
    return {
      ...super.transformNativeEvent(),
      duration: Date.now() - this.startTime,
    };
  }

  public override updateGestureConfig(config: Config): void {
    super.updateGestureConfig(config);

    if (config.minDurationMs !== undefined) {
      this.minDurationMs = config.minDurationMs;
    }

    if (config.maxDist !== undefined) {
      this.maxDistSq = config.maxDist * config.maxDist;
    }

    if (config.numberOfPointers !== undefined) {
      this.numberOfPointers = config.numberOfPointers;
    }
  }

  protected override resetConfig(): void {
    super.resetConfig();
    this.minDurationMs = DEFAULT_MIN_DURATION_MS;
    this.maxDistSq = this.defaultMaxDistSq;
  }

  protected override onStateChange(_newState: State, _oldState: State): void {
    clearTimeout(this.activationTimeout);
  }

  protected override onPointerDown(event: AdaptedEvent): void {
    if (!this.isButtonInConfig(event.button)) {
      return;
    }

    this.tracker.addToTracker(event);
    super.onPointerDown(event);

    this.startX = event.x;
    this.startY = event.y;

    this.tryBegin();
    this.tryActivate();

    this.tryToSendTouchEvent(event);
  }
  protected override onPointerAdd(event: AdaptedEvent): void {
    super.onPointerAdd(event);
    this.tracker.addToTracker(event);

    if (this.tracker.trackedPointersCount > this.numberOfPointers) {
      this.fail();
      return;
    }

    const absoluteCoordsAverage = this.tracker.getAbsoluteCoordsAverage();

    this.startX = absoluteCoordsAverage.x;
    this.startY = absoluteCoordsAverage.y;

    this.tryActivate();
  }

  protected override onPointerMove(event: AdaptedEvent): void {
    super.onPointerMove(event);
    this.tracker.track(event);
    this.checkDistanceFail();
  }

  protected override onPointerOutOfBounds(event: AdaptedEvent): void {
    super.onPointerOutOfBounds(event);
    this.tracker.track(event);
    this.checkDistanceFail();
  }

  protected override onPointerUp(event: AdaptedEvent): void {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);

    if (this.state === State.ACTIVE) {
      this.end();
    } else {
      this.fail();
    }
  }

  protected override onPointerRemove(event: AdaptedEvent): void {
    super.onPointerRemove(event);
    this.tracker.removeFromTracker(event.pointerId);

    if (
      this.tracker.trackedPointersCount < this.numberOfPointers &&
      this.state !== State.ACTIVE
    ) {
      this.fail();
    }
  }

  private tryBegin(): void {
    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.previousTime = Date.now();
    this.startTime = this.previousTime;

    this.begin();
  }

  private tryActivate(): void {
    if (this.tracker.trackedPointersCount !== this.numberOfPointers) {
      return;
    }

    if (this.minDurationMs > 0) {
      this.activationTimeout = setTimeout(() => {
        this.activate();
      }, this.minDurationMs);
    } else if (this.minDurationMs === 0) {
      this.activate();
    }
  }

  private checkDistanceFail(): void {
    const absoluteCoordsAverage = this.tracker.getAbsoluteCoordsAverage();

    const dx = absoluteCoordsAverage.x - this.startX;
    const dy = absoluteCoordsAverage.y - this.startY;
    const distSq = dx * dx + dy * dy;

    if (distSq <= this.maxDistSq) {
      return;
    }

    if (this.state === State.ACTIVE) {
      this.cancel();
    } else {
      this.fail();
    }
  }
}
