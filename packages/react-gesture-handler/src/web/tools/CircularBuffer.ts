export default class CircularBuffer<T> {
  private capacity: number;
  private buffer: T[];
  private index: number;
  private _size: number;

  constructor(size: number) {
    this.capacity = size;
    this.buffer = new Array<T>(size);
    this.index = 0;
    this._size = 0;
  }

  public push(element: T): void {
    this.buffer[this.index] = element;
    this.index = (this.index + 1) % this.capacity;
    this._size = Math.min(this.size + 1, this.capacity);
  }

  public get(at: number): T {
    if (this._size === this.capacity) {
      let index = (this.index + at) % this.capacity;
      if (index < 0) {
        index += this.capacity;
      }

      return this.buffer[index];
    } else {
      return this.buffer[at];
    }
  }

  public clear(): void {
    this.buffer = new Array<T>(this.capacity);
    this.index = 0;
    this._size = 0;
  }

  public get size() {
    return this._size;
  }
}
