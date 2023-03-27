import { AdaptedEvent } from '../interfaces';
import CircularBuffer from './CircularBuffer';
import LeastSquareSolver from './LeastSquareSolver';

export default class VelocityTracker {
  private assumePointerMoveStoppedMilliseconds = 40;
  private historySize = 20;
  private horizonMilliseconds = 300;
  private minSampleSize = 3;

  private samples: CircularBuffer<AdaptedEvent>;

  constructor() {
    this.samples = new CircularBuffer<AdaptedEvent>(this.historySize);
  }

  public add(event: AdaptedEvent): void {
    this.samples.push(event);
  }

  /// Returns an estimate of the velocity of the object being tracked by the
  /// tracker given the current information available to the tracker.
  ///
  /// Information is added using [addPosition].
  ///
  /// Returns null if there is no data on which to base an estimate.
  private getVelocityEstimate(): [number, number] | null {
    const x = [];
    const y = [];
    const w = [];
    const time = [];

    let sampleCount = 0;
    let index = this.samples.size - 1;
    const newestSample = this.samples.get(index);
    if (!newestSample) {
      return null;
    }

    let previousSample = newestSample;

    // Starting with the most recent PointAtTime sample, iterate backwards while
    // the samples represent continuous motion.
    while (sampleCount < this.samples.size) {
      const sample = this.samples.get(index);

      const age = newestSample.time - sample.time;
      const delta = Math.abs(sample.time - previousSample.time);
      previousSample = sample;

      if (
        age > this.horizonMilliseconds ||
        delta > this.assumePointerMoveStoppedMilliseconds
      ) {
        break;
      }

      x.push(sample.x);
      y.push(sample.y);
      w.push(1);
      time.push(-age);

      sampleCount++;
      index--;
    }

    if (sampleCount >= this.minSampleSize) {
      const xSolver = new LeastSquareSolver(time, x, w);
      const xFit = xSolver.solve(2);

      if (xFit !== null) {
        const ySolver = new LeastSquareSolver(time, y, w);
        const yFit = ySolver.solve(2);

        if (yFit !== null) {
          const xVelocity = xFit.coefficients[1] * 1000;
          const yVelocity = yFit.coefficients[1] * 1000;

          return [xVelocity, yVelocity];
        }
      }
    }

    return null;
  }

  public getVelocity(): [number, number] {
    const estimate = this.getVelocityEstimate();
    if (estimate !== null) {
      return estimate;
    }
    return [0, 0];
  }

  public reset(): void {
    this.samples.clear();
  }
}
