export default class CircularBuffer<T> {
  private bufferSize: number;
  private buffer: T[];
  private index: number;
  private actualSize: number;

  constructor(size: number) {
    this.bufferSize = size;
    this.buffer = new Array<T>(size);
    this.index = 0;
    this.actualSize = 0;
  }

  public get size(): number {
    return this.actualSize;
  }

  public push(element: T): void {
    this.buffer[this.index] = element;
    this.index = (this.index + 1) % this.bufferSize;
    this.actualSize = Math.min(this.actualSize + 1, this.bufferSize);
  }

  public get(at: number): T {
    if (this.actualSize === this.bufferSize) {
      let index = (this.index + at) % this.bufferSize;
      if (index < 0) {
        index += this.bufferSize;
      }

      return this.buffer[index];
    } else {
      return this.buffer[at];
    }
  }

  public clear(): void {
    this.buffer = new Array<T>(this.bufferSize);
    this.index = 0;
    this.actualSize = 0;
  }
}
