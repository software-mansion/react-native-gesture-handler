class ManagedProps<T> {
  private usedProps: (keyof T)[] = [];
  private rawProps: T;

  constructor(props: T) {
    this.rawProps = props;
  }

  public reserveProps(props: (keyof T)[]) {
    this.usedProps = this.usedProps.concat(props);
  }

  get remainingProps(): T {
    const mRemainingProps: Record<string | number | symbol, unknown> = {};

    for (const key in this.rawProps) {
      if (this.usedProps.indexOf(key) === -1) {
        mRemainingProps[key] = this.rawProps[key];
        console.log('passing', key);
      }
    }

    return mRemainingProps as T;
  }
}

export { ManagedProps };
